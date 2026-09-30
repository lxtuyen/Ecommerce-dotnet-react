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

            // 3. Calculate shipping fee and grand total
            decimal shippingFee = subtotal >= 150m ? 0m : 9.99m;
            decimal grandTotal = subtotal + shippingFee;
            long amountInCents = (long)Math.Round(grandTotal * 100);

            // 4. Check if actual Stripe key is configured or use local demo intent
            if (string.IsNullOrEmpty(_stripeSecretKey) || _stripeSecretKey.Contains("MockKey") || _stripeSecretKey.Contains("ReplaceWith"))
            {
                response.Data = new PaymentIntentResponseDTO
                {
                    ClientSecret = $"pi_mock_{Guid.NewGuid():N}_secret_demo",
                    PublishableKey = _stripePublishableKey,
                    Amount = grandTotal,
                    Currency = "usd",
                    Subtotal = subtotal,
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
}
