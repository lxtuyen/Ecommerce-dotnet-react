using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs.Order;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Impl;

public class OrderService : IOrderService
{
    private readonly DataContext _context;
    private readonly INotificationService _notificationService;

    public OrderService(DataContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<ServiceResponse<GetOrderDTO>> CreateOrder(CreateOrderDTO request, int? userId)
    {
        var response = new ServiceResponse<GetOrderDTO>();
        try
        {
            if (userId == null || userId <= 0)
            {
                response.Success = false;
                response.Message = "You must be signed in to complete checkout.";
                return response;
            }

            if (request.Items == null || !request.Items.Any())
            {
                response.Success = false;
                response.Message = "Order must contain at least one item.";
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
                response.Message = "One or more items in your cart do not exist.";
                return response;
            }

            // 2. Validate stock & calculate authentic subtotal
            decimal subtotal = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in request.Items)
            {
                var prod = products.First(p => p.Id == item.ProductId);
                if (prod.StockQuantity < item.Quantity)
                {
                    response.Success = false;
                    response.Message = $"Product '{prod.Name}' has only {prod.StockQuantity} items remaining in stock.";
                    return response;
                }

                // Deduct stock
                prod.StockQuantity -= item.Quantity;

                subtotal += prod.Price * item.Quantity;

                orderItems.Add(new OrderItem
                {
                    ProductId = prod.Id,
                    ProductName = prod.Name,
                    ProductImage = prod.Image,
                    Price = prod.Price, // Server-verified price
                    Quantity = item.Quantity,
                    CreatedDateTime = DateTime.UtcNow,
                    UpdatedDateTime = DateTime.UtcNow
                });
            }

            // 3. Check and apply coupon discount if provided
            decimal discountAmount = 0;
            string? appliedCouponCode = null;
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
                    appliedCouponCode = coupon.Code;
                    coupon.UsedCount += 1;
                }
            }

            decimal shippingFee = subtotal >= 150m ? 0m : 9.99m;
            decimal grandTotal = Math.Max(0, subtotal - discountAmount) + shippingFee;

            var paymentStatus = PaymentStatus.Pending;
            if (request.PaymentMethod == "Credit Card" && !string.IsNullOrEmpty(request.PaymentIntentId))
            {
                paymentStatus = PaymentStatus.Paid;
            }

            var order = new Order
            {
                UserId = userId.Value,
                CustomerName = request.CustomerName,
                CustomerEmail = request.CustomerEmail,
                ShippingAddress = request.ShippingAddress,
                PhoneNumber = request.PhoneNumber,
                PaymentMethod = request.PaymentMethod,
                PaymentStatus = paymentStatus,
                PaymentIntentId = request.PaymentIntentId,
                ShippingFee = shippingFee,
                CouponCode = appliedCouponCode,
                DiscountAmount = discountAmount,
                Status = OrderStatus.Processing,
                TotalAmount = grandTotal,
                Notes = request.Notes,
                CreatedDateTime = DateTime.UtcNow,
                UpdatedDateTime = DateTime.UtcNow,
                OrderItems = orderItems
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            _ = _notificationService.NotifyOrderCreated(order);

            response.Data = MapToGetOrderDTO(order);
            response.Message = "Order placed successfully!";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.GetBaseException().Message;
        }

        return response;
    }

    public async Task<ServiceResponse<List<GetOrderDTO>>> GetAllOrders()
    {
        var response = new ServiceResponse<List<GetOrderDTO>>();
        try
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.CreatedDateTime)
                .ToListAsync();

            response.Data = orders.Select(MapToGetOrderDTO).ToList();
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    public async Task<ServiceResponse<GetOrderDTO>> GetOrderById(int id)
    {
        var response = new ServiceResponse<GetOrderDTO>();
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                response.Success = false;
                response.Message = "Order not found.";
                return response;
            }

            response.Data = MapToGetOrderDTO(order);
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    public async Task<ServiceResponse<List<GetOrderDTO>>> GetOrdersByUser(int userId)
    {
        var response = new ServiceResponse<List<GetOrderDTO>>();
        try
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedDateTime)
                .ToListAsync();

            response.Data = orders.Select(MapToGetOrderDTO).ToList();
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    public async Task<ServiceResponse<GetOrderDTO>> UpdateOrderStatus(int id, string status)
    {
        var response = new ServiceResponse<GetOrderDTO>();
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                response.Success = false;
                response.Message = "Order not found.";
                return response;
            }

            if (Enum.TryParse<OrderStatus>(status, true, out var newStatus))
            {
                var oldStatus = order.Status;
                // If transitioning to Cancelled and was not already Cancelled: RESTOCK
                if (newStatus == OrderStatus.Cancelled && order.Status != OrderStatus.Cancelled)
                {
                    await RestockOrderItems(order.OrderItems);

                    if (order.PaymentStatus == PaymentStatus.Paid)
                    {
                        order.PaymentStatus = PaymentStatus.Refunded;
                    }
                }

                order.Status = newStatus;
                _ = _notificationService.NotifyOrderStatusChanged(order, oldStatus, newStatus);
            }
            order.UpdatedDateTime = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            response.Data = MapToGetOrderDTO(order);
            response.Message = "Order status updated.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    public async Task<ServiceResponse<GetOrderDTO>> CancelOrder(int id, int userId, string? reason, bool isAdmin)
    {
        var response = new ServiceResponse<GetOrderDTO>();
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                response.Success = false;
                response.Message = "Order not found.";
                return response;
            }

            // Customer can only cancel their own orders
            if (!isAdmin && order.UserId != userId)
            {
                response.Success = false;
                response.Message = "You are not authorized to cancel this order.";
                return response;
            }

            if (order.Status == OrderStatus.Cancelled)
            {
                response.Success = false;
                response.Message = "This order is already cancelled.";
                return response;
            }

            // Customer cannot cancel if order has already shipped or delivered
            if (order.Status == OrderStatus.Shipped || order.Status == OrderStatus.Delivered)
            {
                response.Success = false;
                response.Message = $"Order is already {order.Status} and cannot be cancelled directly. Please contact support.";
                return response;
            }

            // 1. Restock products into inventory
            await RestockOrderItems(order.OrderItems);

            // 2. Update status and payment status
            order.Status = OrderStatus.Cancelled;
            if (order.PaymentStatus == PaymentStatus.Paid)
            {
                order.PaymentStatus = PaymentStatus.Refunded;
            }

            if (!string.IsNullOrWhiteSpace(reason))
            {
                order.CancelReason = reason;
            }

            order.UpdatedDateTime = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _ = _notificationService.NotifyOrderCancelled(order, reason ?? "User requested cancellation");

            response.Data = MapToGetOrderDTO(order);
            response.Message = "Order cancelled successfully. Stock has been restored.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.GetBaseException().Message;
        }

        return response;
    }

    public async Task<ServiceResponse<string>> GetOrderReceiptHtml(int id, int? userId, bool isAdmin)
    {
        var response = new ServiceResponse<string>();
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                response.Success = false;
                response.Message = "Order not found.";
                return response;
            }

            if (!isAdmin && userId.HasValue && order.UserId != userId.Value)
            {
                response.Success = false;
                response.Message = "Access denied.";
                return response;
            }

            response.Data = _notificationService.GenerateReceiptHtml(order);
            response.Message = "Receipt generated.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    private async Task RestockOrderItems(IEnumerable<OrderItem> orderItems)
    {
        if (orderItems == null || !orderItems.Any()) return;

        var productIds = orderItems.Select(oi => oi.ProductId).Distinct().ToList();
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync();

        foreach (var item in orderItems)
        {
            var prod = products.FirstOrDefault(p => p.Id == item.ProductId);
            if (prod != null)
            {
                prod.StockQuantity += item.Quantity;
            }
        }
    }

    private static GetOrderDTO MapToGetOrderDTO(Order order)
    {
        return new GetOrderDTO
        {
            Id = order.Id,
            UserId = order.UserId,
            CustomerName = order.CustomerName,
            CustomerEmail = order.CustomerEmail,
            ShippingAddress = order.ShippingAddress,
            PhoneNumber = order.PhoneNumber,
            PaymentMethod = order.PaymentMethod,
            PaymentStatus = order.PaymentStatus.ToString(),
            PaymentIntentId = order.PaymentIntentId,
            ShippingFee = order.ShippingFee,
            CouponCode = order.CouponCode,
            DiscountAmount = order.DiscountAmount,
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount,
            Notes = order.Notes,
            CancelReason = order.CancelReason,
            CreatedDateTime = order.CreatedDateTime,
            OrderItems = order.OrderItems.Select(oi => new GetOrderItemDTO
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.ProductName,
                ProductImage = oi.ProductImage,
                Price = oi.Price,
                Quantity = oi.Quantity
            }).ToList()
        };
    }
}
