using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.DTOs.Order;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]s")]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<ActionResult<ServiceResponse<GetOrderDTO>>> CreateOrder([FromBody] CreateOrderDTO request)
    {
        int? userId = null;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int parsedId))
        {
            userId = parsedId;
        }

        var response = await _orderService.CreateOrder(request, userId);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpGet("my-orders")]
    [Authorize]
    public async Task<ActionResult<ServiceResponse<List<GetOrderDTO>>>> GetMyOrders()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new ServiceResponse<List<GetOrderDTO>> { Success = false, Message = "Invalid user token." });
        }

        var response = await _orderService.GetOrdersByUser(userId);
        return Ok(response);
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServiceResponse<List<GetOrderDTO>>>> GetAllOrders()
    {
        var response = await _orderService.GetAllOrders();
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<GetOrderDTO>>> GetOrderById(int id)
    {
        var response = await _orderService.GetOrderById(id);
        if (!response.Success)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServiceResponse<GetOrderDTO>>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDTO request)
    {
        var response = await _orderService.UpdateOrderStatus(id, request.Status);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }
}
