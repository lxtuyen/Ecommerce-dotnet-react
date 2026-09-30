using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs.Coupon;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Impl;

public class CouponService : ICouponService
{
    private readonly DataContext _context;

    public CouponService(DataContext context)
    {
        _context = context;
    }

    public async Task<ServiceResponse<CouponValidationResultDTO>> ValidateCoupon(string code, decimal subtotal)
    {
        var response = new ServiceResponse<CouponValidationResultDTO>();
        try
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                response.Success = false;
                response.Message = "Please enter a coupon code.";
                return response;
            }

            var cleanCode = code.Trim().ToUpper();
            var coupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code.ToUpper() == cleanCode && c.IsActive);

            if (coupon == null)
            {
                response.Success = false;
                response.Message = $"Coupon '{cleanCode}' does not exist or is inactive.";
                response.Data = new CouponValidationResultDTO
                {
                    Code = cleanCode,
                    IsValid = false,
                    Message = response.Message
                };
                return response;
            }

            if (coupon.ExpiryDate.HasValue && coupon.ExpiryDate.Value < DateTime.UtcNow)
            {
                response.Success = false;
                response.Message = $"Coupon '{cleanCode}' expired on {coupon.ExpiryDate.Value:yyyy-MM-dd}.";
                response.Data = new CouponValidationResultDTO
                {
                    Code = cleanCode,
                    IsValid = false,
                    Message = response.Message
                };
                return response;
            }

            if (coupon.UsageLimit.HasValue && coupon.UsedCount >= coupon.UsageLimit.Value)
            {
                response.Success = false;
                response.Message = $"Coupon '{cleanCode}' has reached its usage limit.";
                response.Data = new CouponValidationResultDTO
                {
                    Code = cleanCode,
                    IsValid = false,
                    Message = response.Message
                };
                return response;
            }

            if (subtotal < coupon.MinOrderAmount)
            {
                response.Success = false;
                response.Message = $"Minimum subtotal of ${coupon.MinOrderAmount:0.00} required to apply coupon '{cleanCode}'.";
                response.Data = new CouponValidationResultDTO
                {
                    Code = cleanCode,
                    IsValid = false,
                    MinOrderAmount = coupon.MinOrderAmount,
                    Message = response.Message
                };
                return response;
            }

            decimal discount = 0;
            if (coupon.DiscountType == DiscountType.Percentage)
            {
                discount = subtotal * (coupon.DiscountValue / 100m);
                if (coupon.MaxDiscountAmount.HasValue && discount > coupon.MaxDiscountAmount.Value)
                {
                    discount = coupon.MaxDiscountAmount.Value;
                }
            }
            else
            {
                discount = Math.Min(subtotal, coupon.DiscountValue);
            }

            discount = Math.Round(discount, 2);

            response.Data = new CouponValidationResultDTO
            {
                Code = coupon.Code,
                Description = coupon.Description,
                DiscountType = coupon.DiscountType.ToString(),
                DiscountValue = coupon.DiscountValue,
                DiscountAmount = discount,
                MinOrderAmount = coupon.MinOrderAmount,
                IsValid = true,
                Message = $"Coupon '{coupon.Code}' applied successfully! Saved ${discount:0.00}"
            };
            response.Message = response.Data.Message;
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.GetBaseException().Message;
        }

        return response;
    }

    public async Task<ServiceResponse<List<GetCouponDTO>>> GetAllCoupons()
    {
        var response = new ServiceResponse<List<GetCouponDTO>>();
        try
        {
            var coupons = await _context.Coupons
                .OrderByDescending(c => c.CreatedDateTime)
                .ToListAsync();

            response.Data = coupons.Select(c => new GetCouponDTO
            {
                Id = c.Id,
                Code = c.Code,
                Description = c.Description,
                DiscountType = c.DiscountType.ToString(),
                DiscountValue = c.DiscountValue,
                MinOrderAmount = c.MinOrderAmount,
                MaxDiscountAmount = c.MaxDiscountAmount,
                ExpiryDate = c.ExpiryDate,
                UsageLimit = c.UsageLimit,
                UsedCount = c.UsedCount,
                IsActive = c.IsActive
            }).ToList();
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    public async Task<ServiceResponse<GetCouponDTO>> CreateCoupon(CreateCouponDTO dto)
    {
        var response = new ServiceResponse<GetCouponDTO>();
        try
        {
            var cleanCode = dto.Code.Trim().ToUpper();
            var exists = await _context.Coupons.AnyAsync(c => c.Code.ToUpper() == cleanCode);
            if (exists)
            {
                response.Success = false;
                response.Message = $"Coupon with code '{cleanCode}' already exists.";
                return response;
            }

            var coupon = new Coupon
            {
                Code = cleanCode,
                Description = dto.Description,
                DiscountType = dto.DiscountType,
                DiscountValue = dto.DiscountValue,
                MinOrderAmount = dto.MinOrderAmount,
                MaxDiscountAmount = dto.MaxDiscountAmount,
                ExpiryDate = dto.ExpiryDate,
                UsageLimit = dto.UsageLimit,
                UsedCount = 0,
                IsActive = true,
                CreatedDateTime = DateTime.UtcNow,
                UpdatedDateTime = DateTime.UtcNow
            };

            _context.Coupons.Add(coupon);
            await _context.SaveChangesAsync();

            response.Data = new GetCouponDTO
            {
                Id = coupon.Id,
                Code = coupon.Code,
                Description = coupon.Description,
                DiscountType = coupon.DiscountType.ToString(),
                DiscountValue = coupon.DiscountValue,
                MinOrderAmount = coupon.MinOrderAmount,
                MaxDiscountAmount = coupon.MaxDiscountAmount,
                ExpiryDate = coupon.ExpiryDate,
                UsageLimit = coupon.UsageLimit,
                UsedCount = coupon.UsedCount,
                IsActive = coupon.IsActive
            };
            response.Message = "Coupon created successfully.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.GetBaseException().Message;
        }

        return response;
    }

    public async Task<ServiceResponse<bool>> DeleteCoupon(int id)
    {
        var response = new ServiceResponse<bool>();
        try
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null)
            {
                response.Success = false;
                response.Message = "Coupon not found.";
                return response;
            }

            _context.Coupons.Remove(coupon);
            await _context.SaveChangesAsync();
            response.Data = true;
            response.Message = "Coupon deleted successfully.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }
}
