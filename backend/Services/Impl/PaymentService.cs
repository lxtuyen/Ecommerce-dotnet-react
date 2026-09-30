using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs.Payment;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace backend.Services.Impl;

public class PaymentService : IPaymentService
{
    private readonly DataContext _context;
    private readonly IConfiguration _configuration;
    private readonly string _stripeSecretKey;
    private readonly string _stripePublishableKey;

    public PaymentService(DataContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
        _stripeSecretKey = _configuration["Stripe:SecretKey"] ?? "";
        _stripePublishableKey = _configuration["Stripe:PublishableKey"] ?? "";

        if (!string.IsNullOrEmpty(_stripeSecretKey) && !_stripeSecretKey.Contains("MockKey"))
        {
            StripeConfiguration.ApiKey = _stripeSecretKey;
        }
    }

    public ServiceResponse<StripeConfigDTO> GetStripeConfig()
    {
        return new ServiceResponse<StripeConfigDTO>
        {
            Data = new StripeConfigDTO
            {
                PublishableKey = _stripePublishableKey
            }
        };
    }

    public async Task<ServiceResponse<PaymentIntentResponseDTO>> CreatePaymentIntent(CreatePaymentIntentDTO request, int userId)
    {
        var response = new ServiceResponse<PaymentIntentResponseDTO>();
        try
        {
            if (request.Items == null || !request.Items.Any())
            {
                response.Success = false;
                response.Message = "No items specified for payment.";
                return response;
            }

            // 1. Fetch real products from DB to prevent client price tampering
            var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            if (products.Count != productIds.Count)
            {
                response.Success = false;
                response.Message = "One or more products in your cart could not be found.";
                return response;
            }

            // 2. Validate stock and calculate verified subtotal
            decimal subtotal = 0;
            foreach (var item in request.Items)
            {
                var prod = products.First(p => p.Id == item.ProductId);
                if (prod.StockQuantity < item.Quantity)
                {
                    response.Success = false;
                    response.Message = $"Product '{prod.Name}' has only {prod.StockQuantity} items in stock.";
                    return response;
                }
                subtotal += prod.Price * item.Quantity;
            }

            // 3. Check and apply coupon discount if provided
            decimal discountAmount = 0;
            if (!string.IsNullOrWhiteSpace(request.CouponCode))
            {
                var cleanCode = request.CouponCode.Trim().ToUpper();
                var coupon = await _context.Coupons
                    .FirstOrDefaultAsync(c => c.Code.ToUpper() == cleanCode && c.IsActive);

                if (coupon != null &&
                    (!coupon.ExpiryDate.HasValue || coupon.ExpiryDate.Value >= DateTime.UtcNow) &&
                    (!coupon.UsageLimit.HasValue || coupon.UsedCount < coupon.UsageLimit.Value) &&
                    subtotal >= coupon.MinOrderAmount)
                {
                    decimal d = 0;
                    if (coupon.DiscountType == DiscountType.Percentage)
                    {
                        d = subtotal * (coupon.DiscountValue / 100m);
                        if (coupon.MaxDiscountAmount.HasValue && d > coupon.MaxDiscountAmount.Value)
                        {
                            d = coupon.MaxDiscountAmount.Value;
                        }
                    }
                    else
                    {
                        d = Math.Min(subtotal, coupon.DiscountValue);
                    }
                    discountAmount = Math.Round(d, 2);
                }
            }

            // 4. Calculate shipping fee and grand total
            decimal shippingFee = subtotal >= 150m ? 0m : 9.99m;
            decimal grandTotal = Math.Max(0, subtotal - discountAmount) + shippingFee;
            long amountInCents = (long)Math.Round(grandTotal * 100);

            // 5. Check if actual Stripe key is configured or use local demo intent
            if (string.IsNullOrEmpty(_stripeSecretKey) || _stripeSecretKey.Contains("MockKey") || _stripeSecretKey.Contains("ReplaceWith"))
            {
                response.Data = new PaymentIntentResponseDTO
                {
                    ClientSecret = $"pi_mock_{Guid.NewGuid():N}_secret_demo",
                    PublishableKey = _stripePublishableKey,
                    Amount = grandTotal,
                    Currency = "usd",
                    Subtotal = subtotal,
                    DiscountAmount = discountAmount,
                    ShippingFee = shippingFee
                };
                response.Message = "Demo payment intent initialized. Configure Stripe:SecretKey in appsettings.json for real Stripe gateway.";
                return response;
            }

            var service = new PaymentIntentService();
            var options = new PaymentIntentCreateOptions
            {
                Amount = amountInCents,
                Currency = "usd",
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true,
                },
                Metadata = new Dictionary<string, string>
                {
                    { "userId", userId.ToString() },
                    { "customerEmail", request.CustomerEmail ?? "" },
                    { "customerName", request.CustomerName ?? "" },
                    { "couponCode", request.CouponCode ?? "" },
                    { "discountAmount", discountAmount.ToString("0.00") },
                    { "itemCount", request.Items.Count.ToString() }
                }
            };

            var paymentIntent = await service.CreateAsync(options);

            response.Data = new PaymentIntentResponseDTO
            {
                ClientSecret = paymentIntent.ClientSecret,
                PublishableKey = _stripePublishableKey,
                Amount = grandTotal,
                Currency = "usd",
                Subtotal = subtotal,
                DiscountAmount = discountAmount,
                ShippingFee = shippingFee
            };
            response.Message = "Payment intent created successfully.";
        }
        catch (StripeException stripeEx)
        {
            response.Success = false;
            response.Message = $"Stripe Error: {stripeEx.StripeError?.Message ?? stripeEx.Message}";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.GetBaseException().Message;
        }

        return response;
    }

    public async Task<ServiceResponse<bool>> HandleWebhookEvent(string json, string stripeSignature)
    {
        var response = new ServiceResponse<bool>();
        try
        {
            Event stripeEvent;
            var webhookSecret = _configuration["Stripe:WebhookSecret"];

            if (!string.IsNullOrEmpty(webhookSecret) && !webhookSecret.Contains("Mock") && !string.IsNullOrEmpty(stripeSignature))
            {
                stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, webhookSecret);
            }
            else
            {
                stripeEvent = EventUtility.ParseEvent(json);
            }

            if (stripeEvent.Type == "payment_intent.succeeded")
            {
                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                if (paymentIntent != null)
                {
                    var order = await _context.Orders
                        .FirstOrDefaultAsync(o => o.PaymentIntentId == paymentIntent.Id);

                    if (order != null)
                    {
                        order.PaymentStatus = PaymentStatus.Paid;
                        if (order.Status == OrderStatus.Pending)
                        {
                            order.Status = OrderStatus.Processing;
                        }
                        await _context.SaveChangesAsync();
                    }
                }
            }
            else if (stripeEvent.Type == "payment_intent.payment_failed")
            {
                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                if (paymentIntent != null)
                {
                    var order = await _context.Orders
                        .FirstOrDefaultAsync(o => o.PaymentIntentId == paymentIntent.Id);

                    if (order != null)
                    {
                        order.PaymentStatus = PaymentStatus.Failed;
                        await _context.SaveChangesAsync();
                    }
                }
            }
            else if (stripeEvent.Type == "charge.refunded")
            {
                var charge = stripeEvent.Data.Object as Charge;
                if (charge != null && !string.IsNullOrEmpty(charge.PaymentIntentId))
                {
                    var order = await _context.Orders
                        .Include(o => o.OrderItems)
                        .FirstOrDefaultAsync(o => o.PaymentIntentId == charge.PaymentIntentId);

                    if (order != null)
                    {
                        order.PaymentStatus = PaymentStatus.Refunded;
                        if (order.Status != OrderStatus.Cancelled)
                        {
                            order.Status = OrderStatus.Cancelled;
                            order.CancelReason = "Auto-cancelled due to Stripe charge refund";
                            foreach (var item in order.OrderItems)
                            {
                                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == item.ProductId);
                                if (product != null)
                                {
                                    product.StockQuantity += item.Quantity;
                                }
                            }
                        }
                        await _context.SaveChangesAsync();
                    }
                }
            }

            response.Data = true;
            response.Message = $"Processed Stripe event: {stripeEvent.Type}";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Webhook processing error: {ex.Message}";
        }

        return response;
    }
}

