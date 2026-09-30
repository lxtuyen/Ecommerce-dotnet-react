using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.DTOs.Address;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/addresses")]
[Authorize]
public class AddressController : ControllerBase
{
    private readonly IAddressService _addressService;

    public AddressController(IAddressService addressService)
    {
        _addressService = addressService;
    }

    [HttpGet]
    public async Task<ActionResult<ServiceResponse<List<AddressDTO>>>> GetMyAddresses()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new ServiceResponse<List<AddressDTO>> { Success = false, Message = "Unauthorized" });
        }

        var response = await _addressService.GetUserAddresses(userId.Value);
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceResponse<AddressDTO>>> AddAddress([FromBody] CreateAddressDTO request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new ServiceResponse<AddressDTO> { Success = false, Message = "Unauthorized" });
        }

        var response = await _addressService.AddAddress(userId.Value, request);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPut("{id}/default")]
    public async Task<ActionResult<ServiceResponse<AddressDTO>>> SetDefault(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new ServiceResponse<AddressDTO> { Success = false, Message = "Unauthorized" });
        }

        var response = await _addressService.SetDefaultAddress(userId.Value, id);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAddress(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new ServiceResponse<bool> { Success = false, Message = "Unauthorized" });
        }

        var response = await _addressService.DeleteAddress(userId.Value, id);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(claim, out int id))
        {
            return id;
        }
        return null;
    }
}
