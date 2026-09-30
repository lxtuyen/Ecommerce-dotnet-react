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

    public OrderService(DataContext context)
    {
        _context = context;
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

            decimal shippingFee = subtotal >= 150m ? 0m : 9.99m;
            decimal grandTotal = subtotal + shippingFee;

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
                Status = OrderStatus.Processing,
                TotalAmount = grandTotal,
                Notes = request.Notes,
                CreatedDateTime = DateTime.UtcNow,
                UpdatedDateTime = DateTime.UtcNow,
                OrderItems = orderItems
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

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

            if (Enum.TryParse<OrderStatus>(status, true, out var orderStatus))
            {
                order.Status = orderStatus;
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
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount,
            Notes = order.Notes,
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
