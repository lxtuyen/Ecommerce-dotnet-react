using System.Collections.Generic;

namespace backend.DTOs.Order;

public class CreateOrderItemDTO
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImage { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public class CreateOrderDTO
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = "Credit Card";
    public string? Notes { get; set; }
    public List<CreateOrderItemDTO> Items { get; set; } = new();
}
