using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs.Coupon;
using backend.Models;

namespace backend.Services;

public interface ICouponService
{
    Task<ServiceResponse<CouponValidationResultDTO>> ValidateCoupon(string code, decimal subtotal);
    Task<ServiceResponse<List<GetCouponDTO>>> GetAllCoupons();
    Task<ServiceResponse<GetCouponDTO>> CreateCoupon(CreateCouponDTO dto);
    Task<ServiceResponse<bool>> DeleteCoupon(int id);
}
