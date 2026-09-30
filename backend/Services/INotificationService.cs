using System.Threading.Tasks;
using backend.Models;

namespace backend.Services;

public interface INotificationService
{
    string GenerateReceiptHtml(Order order);
    Task NotifyOrderCreated(Order order);
    Task NotifyOrderStatusChanged(Order order, OrderStatus oldStatus, OrderStatus newStatus);
    Task NotifyOrderCancelled(Order order, string reason);
}
