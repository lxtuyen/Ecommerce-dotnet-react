using System;
using System.Text;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.Extensions.Logging;

namespace backend.Services.Impl;

public class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(ILogger<NotificationService> logger)
    {
        _logger = logger;
    }

    public string GenerateReceiptHtml(Order order)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<!DOCTYPE html>");
        sb.AppendLine("<html lang='en'>");
        sb.AppendLine("<head>");
        sb.AppendLine("  <meta charset='utf-8'>");
        sb.AppendLine("  <meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        sb.AppendLine($"  <title>Receipt - Order #TV-{order.Id}</title>");
        sb.AppendLine("  <style>");
        sb.AppendLine("    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 40px 20px; }");
        sb.AppendLine("    .receipt-box { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }");
        sb.AppendLine("    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 25px; margin-bottom: 30px; }");
        sb.AppendLine("    .brand-title { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; }");
        sb.AppendLine("    .badge { display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; }");
        sb.AppendLine("    .badge-paid { background: #dcfce7; color: #15803d; }");
        sb.AppendLine("    .badge-pending { background: #fef9c3; color: #854d0e; }");
        sb.AppendLine("    .badge-refunded { background: #e0e7ff; color: #3730a3; }");
        sb.AppendLine("    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 13px; line-height: 1.6; }");
        sb.AppendLine("    .info-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }");
        sb.AppendLine("    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }");
        sb.AppendLine("    th { text-align: left; padding: 12px 8px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }");
        sb.AppendLine("    td { padding: 14px 8px; border-bottom: 1px solid #f8fafc; font-size: 13px; }");
        sb.AppendLine("    .text-right { text-align: right; }");
        sb.AppendLine("    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #64748b; }");
        sb.AppendLine("    .summary-total { display: flex; justify-content: space-between; padding: 16px 0 0 0; font-size: 18px; font-weight: 800; color: #0f172a; border-top: 2px solid #f1f5f9; margin-top: 10px; }");
        sb.AppendLine("    .footer { text-align: center; margin-top: 35px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; }");
        sb.AppendLine("  </style>");
        sb.AppendLine("</head>");
        sb.AppendLine("<body>");
        sb.AppendLine("  <div class='receipt-box'>");
        sb.AppendLine("    <div class='header'>");
        sb.AppendLine("      <div>");
        sb.AppendLine("        <h1 class='brand-title'>TechVault Store</h1>");
        sb.AppendLine("        <div style='font-size: 12px; color: #64748b; margin-top: 4px;'>Official Electronic Receipt</div>");
        sb.AppendLine("      </div>");
        sb.AppendLine("      <div style='text-align: right;'>");
        sb.AppendLine($"        <div style='font-size: 16px; font-weight: 800;'>#TV-{order.Id}</div>");
        sb.AppendLine($"        <div style='font-size: 12px; color: #64748b; margin-top: 2px;'>{order.CreatedDateTime:MMM dd, yyyy HH:mm}</div>");
        sb.AppendLine($"        <div style='margin-top: 6px;'><span class='badge badge-{(order.PaymentStatus == PaymentStatus.Paid ? "paid" : order.PaymentStatus == PaymentStatus.Refunded ? "refunded" : "pending")}'>{order.PaymentStatus}</span></div>");
        sb.AppendLine("      </div>");
        sb.AppendLine("    </div>");

        sb.AppendLine("    <div class='info-grid'>");
        sb.AppendLine("      <div>");
        sb.AppendLine("        <div class='info-label'>Billed & Shipped To</div>");
        sb.AppendLine($"        <div style='font-weight: 700;'>{order.CustomerName}</div>");
        sb.AppendLine($"        <div>{order.CustomerEmail}</div>");
        sb.AppendLine($"        <div>{order.PhoneNumber}</div>");
        sb.AppendLine($"        <div>{order.ShippingAddress}</div>");
        sb.AppendLine("      </div>");
        sb.AppendLine("      <div>");
        sb.AppendLine("        <div class='info-label'>Payment Summary</div>");
        sb.AppendLine($"        <div><strong>Method:</strong> {order.PaymentMethod}</div>");
        if (!string.IsNullOrEmpty(order.PaymentIntentId))
        {
            sb.AppendLine($"        <div style='word-break: break-all;'><strong>Tx ID:</strong> {order.PaymentIntentId}</div>");
        }
        sb.AppendLine($"        <div><strong>Status:</strong> {order.Status}</div>");
        sb.AppendLine("      </div>");
        sb.AppendLine("    </div>");

        sb.AppendLine("    <table>");
        sb.AppendLine("      <thead>");
        sb.AppendLine("        <tr>");
        sb.AppendLine("          <th>Item Description</th>");
        sb.AppendLine("          <th class='text-right'>Qty</th>");
        sb.AppendLine("          <th class='text-right'>Unit Price</th>");
        sb.AppendLine("          <th class='text-right'>Amount</th>");
        sb.AppendLine("        </tr>");
        sb.AppendLine("      </thead>");
        sb.AppendLine("      <tbody>");

        decimal subtotal = 0;
        foreach (var item in order.OrderItems)
        {
            decimal itemTotal = item.Price * item.Quantity;
            subtotal += itemTotal;
            sb.AppendLine("        <tr>");
            sb.AppendLine($"          <td style='font-weight: 600;'>{item.ProductName}</td>");
            sb.AppendLine($"          <td class='text-right'>{item.Quantity}</td>");
            sb.AppendLine($"          <td class='text-right'>${item.Price:N2}</td>");
            sb.AppendLine($"          <td class='text-right' style='font-weight: 700;'>${itemTotal:N2}</td>");
            sb.AppendLine("        </tr>");
        }

        sb.AppendLine("      </tbody>");
        sb.AppendLine("    </table>");

        sb.AppendLine("    <div>");
        sb.AppendLine($"      <div class='summary-row'><span>Subtotal</span><span>${subtotal:N2}</span></div>");
        if (order.ShippingFee > 0)
        {
            sb.AppendLine($"      <div class='summary-row'><span>Shipping & Handling</span><span>${order.ShippingFee:N2}</span></div>");
        }
        else
        {
            sb.AppendLine("      <div class='summary-row'><span>Shipping</span><span style='color: #16a34a; font-weight: 600;'>FREE</span></div>");
        }

        if (order.DiscountAmount > 0)
        {
            sb.AppendLine($"      <div class='summary-row' style='color: #16a34a; font-weight: 600;'><span>Coupon ({order.CouponCode ?? "VOUCHER"})</span><span>-${order.DiscountAmount:N2}</span></div>");
        }

        sb.AppendLine($"      <div class='summary-total'><span>Total Paid</span><span>${order.TotalAmount:N2}</span></div>");
        sb.AppendLine("    </div>");

        sb.AppendLine("    <div class='footer'>");
        sb.AppendLine("      <p>Thank you for purchasing with TechVault! For warranty inquiries or customer support, visit help.techvault.store</p>");
        sb.AppendLine("    </div>");
        sb.AppendLine("  </div>");
        sb.AppendLine("</body>");
        sb.AppendLine("</html>");

        return sb.ToString();
    }

    public Task NotifyOrderCreated(Order order)
    {
        _logger.LogInformation("[NotificationService] Sent Order Confirmation Email for Order #TV-{OrderId} to {CustomerEmail}", order.Id, order.CustomerEmail);
        return Task.CompletedTask;
    }

    public Task NotifyOrderStatusChanged(Order order, OrderStatus oldStatus, OrderStatus newStatus)
    {
        _logger.LogInformation("[NotificationService] Sent Order Status Update ({OldStatus} -> {NewStatus}) for Order #TV-{OrderId} to {CustomerEmail}", oldStatus, newStatus, order.Id, order.CustomerEmail);
        return Task.CompletedTask;
    }

    public Task NotifyOrderCancelled(Order order, string reason)
    {
        _logger.LogInformation("[NotificationService] Sent Cancellation Notice for Order #TV-{OrderId} to {CustomerEmail}. Reason: {Reason}", order.Id, order.CustomerEmail, reason);
        return Task.CompletedTask;
    }
}
