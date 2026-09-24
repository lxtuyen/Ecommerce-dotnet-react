using System;
using System.Collections.Generic;

namespace backend.DTOs.Order;

public class GetOrderItemDTO
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImage { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public class GetOrderDTO
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public List<GetOrderItemDTO> OrderItems { get; set; } = new();
}

public class UpdateOrderStatusDTO
{
    public string Status { get; set; } = "Processing";
}
