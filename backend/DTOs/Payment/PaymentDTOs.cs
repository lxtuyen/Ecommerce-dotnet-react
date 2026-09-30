using System.Collections.Generic;

namespace backend.DTOs.Payment;

public class PaymentCartItemDTO
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class CreatePaymentIntentDTO
{
    public List<PaymentCartItemDTO> Items { get; set; } = new();
    public string? CustomerEmail { get; set; }
    public string? CustomerName { get; set; }
}

public class PaymentIntentResponseDTO
{
    public string ClientSecret { get; set; } = string.Empty;
    public string PublishableKey { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "usd";
    public decimal Subtotal { get; set; }
    public decimal ShippingFee { get; set; }
}

public class StripeConfigDTO
{
    public string PublishableKey { get; set; } = string.Empty;
}
