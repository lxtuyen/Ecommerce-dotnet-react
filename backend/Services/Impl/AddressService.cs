using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs.Address;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Impl;

public class AddressService : IAddressService
{
    private readonly DataContext _context;

    public AddressService(DataContext context)
    {
        _context = context;
    }

    public async Task<ServiceResponse<List<AddressDTO>>> GetUserAddresses(int userId)
    {
        var response = new ServiceResponse<List<AddressDTO>>();
        try
        {
            var addresses = await _context.UserAddresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync();

            response.Data = addresses.Select(MapToDTO).ToList();
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    public async Task<ServiceResponse<AddressDTO>> AddAddress(int userId, CreateAddressDTO dto)
    {
        var response = new ServiceResponse<AddressDTO>();
        try
        {
            var existingAddresses = await _context.UserAddresses
                .Where(a => a.UserId == userId)
                .ToListAsync();

            bool isDefault = dto.IsDefault || !existingAddresses.Any();

            if (isDefault)
            {
                foreach (var addr in existingAddresses)
                {
                    addr.IsDefault = false;
                }
            }

            var newAddress = new UserAddress
            {
                UserId = userId,
                FullName = dto.FullName.Trim(),
                Phone = dto.Phone.Trim(),
                AddressLine = dto.AddressLine.Trim(),
                City = dto.City.Trim(),
                ZipCode = dto.ZipCode.Trim(),
                Label = string.IsNullOrWhiteSpace(dto.Label) ? "Home" : dto.Label.Trim(),
                IsDefault = isDefault,
                CreatedAt = DateTime.UtcNow
            };

            _context.UserAddresses.Add(newAddress);
            await _context.SaveChangesAsync();

            response.Data = MapToDTO(newAddress);
            response.Message = "Shipping address added successfully.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    public async Task<ServiceResponse<AddressDTO>> SetDefaultAddress(int userId, int addressId)
    {
        var response = new ServiceResponse<AddressDTO>();
        try
        {
            var addresses = await _context.UserAddresses
                .Where(a => a.UserId == userId)
                .ToListAsync();

            var target = addresses.FirstOrDefault(a => a.Id == addressId);
            if (target == null)
            {
                response.Success = false;
                response.Message = "Address not found.";
                return response;
            }

            foreach (var addr in addresses)
            {
                addr.IsDefault = (addr.Id == addressId);
            }

            await _context.SaveChangesAsync();

            response.Data = MapToDTO(target);
            response.Message = "Default shipping address updated.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    public async Task<ServiceResponse<bool>> DeleteAddress(int userId, int addressId)
    {
        var response = new ServiceResponse<bool>();
        try
        {
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

            if (address == null)
            {
                response.Success = false;
                response.Message = "Address not found.";
                return response;
            }

            bool wasDefault = address.IsDefault;
            _context.UserAddresses.Remove(address);
            await _context.SaveChangesAsync();

            // If deleted address was default, set another remaining address as default
            if (wasDefault)
            {
                var nextDefault = await _context.UserAddresses
                    .Where(a => a.UserId == userId)
                    .OrderByDescending(a => a.CreatedAt)
                    .FirstOrDefaultAsync();

                if (nextDefault != null)
                {
                    nextDefault.IsDefault = true;
                    await _context.SaveChangesAsync();
                }
            }

            response.Data = true;
            response.Message = "Address removed successfully.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    private static AddressDTO MapToDTO(UserAddress a) => new()
    {
        Id = a.Id,
        UserId = a.UserId,
        FullName = a.FullName,
        Phone = a.Phone,
        AddressLine = a.AddressLine,
        City = a.City,
        ZipCode = a.ZipCode,
        Label = a.Label,
        IsDefault = a.IsDefault,
        CreatedAt = a.CreatedAt
    };
}
