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
            if (request.Items == null || !request.Items.Any())
            {
                response.Success = false;
                response.Message = "Order must contain at least one item.";
                return response;
            }

            decimal total = request.Items.Sum(i => i.Price * i.Quantity);

            var order = new Order
            {
                UserId = userId ?? 0,
                CustomerName = request.CustomerName,
                CustomerEmail = request.CustomerEmail,
                ShippingAddress = request.ShippingAddress,
                PhoneNumber = request.PhoneNumber,
                PaymentMethod = request.PaymentMethod,
                Notes = request.Notes,
                Status = OrderStatus.Processing,
                TotalAmount = total,
                CreatedDateTime = DateTime.UtcNow,
                UpdatedDateTime = DateTime.UtcNow,
                OrderItems = request.Items.Select(item => new OrderItem
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    ProductImage = item.ProductImage,
                    Price = item.Price,
                    Quantity = item.Quantity,
                    CreatedDateTime = DateTime.UtcNow,
                    UpdatedDateTime = DateTime.UtcNow
                }).ToList()
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            response.Data = MapToGetOrderDTO(order);
            response.Message = "Order placed successfully!";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
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
