using System.Security.Claims;
using System.Threading.Tasks;
using backend.DTOs.Review;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]s")]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<ServiceResponse<ProductReviewSummaryDTO>>> GetProductReviews(int productId)
    {
        int? currentUserId = null;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdClaim, out int uid))
        {
            currentUserId = uid;
        }

        var response = await _reviewService.GetProductReviews(productId, currentUserId);
        if (!response.Success)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpPost("product/{productId}")]
    [Authorize]
    public async Task<ActionResult<ServiceResponse<GetReviewDTO>>> AddOrUpdateReview(int productId, [FromBody] CreateReviewDTO request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new ServiceResponse<GetReviewDTO>
            {
                Success = false,
                Message = "User is not authorized."
            });
        }

        var response = await _reviewService.AddOrUpdateReview(productId, userId, request);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteReview(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new ServiceResponse<bool>
            {
                Success = false,
                Message = "User is not authorized."
            });
        }

        bool isAdmin = User.IsInRole("Admin") || User.FindFirst(ClaimTypes.Role)?.Value == "Admin";
        var response = await _reviewService.DeleteReview(id, userId, isAdmin);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }
}
