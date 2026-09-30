using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs.Coupon;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]s")]
public class CouponController : ControllerBase
{
    private readonly ICouponService _couponService;

    public CouponController(ICouponService couponService)
    {
        _couponService = couponService;
    }

    [HttpPost("validate")]
    public async Task<ActionResult<ServiceResponse<CouponValidationResultDTO>>> ValidateCoupon([FromBody] ValidateCouponRequestDTO request)
    {
        var response = await _couponService.ValidateCoupon(request.Code, request.Subtotal);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpGet]
    public async Task<ActionResult<ServiceResponse<List<GetCouponDTO>>>> GetAllCoupons()
    {
        var response = await _couponService.GetAllCoupons();
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServiceResponse<GetCouponDTO>>> CreateCoupon([FromBody] CreateCouponDTO request)
    {
        var response = await _couponService.CreateCoupon(request);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteCoupon(int id)
    {
        var response = await _couponService.DeleteCoupon(id);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }
}
