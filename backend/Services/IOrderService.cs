using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs.Order;
using backend.Models;

namespace backend.Services;

public interface IOrderService
{
    Task<ServiceResponse<GetOrderDTO>> CreateOrder(CreateOrderDTO request, int? userId);
    Task<ServiceResponse<List<GetOrderDTO>>> GetOrdersByUser(int userId);
    Task<ServiceResponse<List<GetOrderDTO>>> GetAllOrders();
    Task<ServiceResponse<GetOrderDTO>> GetOrderById(int id);
    Task<ServiceResponse<GetOrderDTO>> UpdateOrderStatus(int id, string status);
}
