using System.Security.Claims;
using System.Threading.Tasks;
using backend.DTOs.Payment;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]s")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet("config")]
    public ActionResult<ServiceResponse<StripeConfigDTO>> GetConfig()
    {
        var response = _paymentService.GetStripeConfig();
        return Ok(response);
    }

    [HttpPost("create-payment-intent")]
    [Authorize]
    public async Task<ActionResult<ServiceResponse<PaymentIntentResponseDTO>>> CreatePaymentIntent([FromBody] CreatePaymentIntentDTO request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new ServiceResponse<PaymentIntentResponseDTO>
            {
                Success = false,
                Message = "You must be signed in to perform this action."
            });
        }

        var response = await _paymentService.CreatePaymentIntent(request, userId);
        if (!response.Success)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }
}
