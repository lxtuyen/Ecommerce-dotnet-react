using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs.Address;
using backend.Models;

namespace backend.Services;

public interface IAddressService
{
    Task<ServiceResponse<List<AddressDTO>>> GetUserAddresses(int userId);
    Task<ServiceResponse<AddressDTO>> AddAddress(int userId, CreateAddressDTO dto);
    Task<ServiceResponse<AddressDTO>> SetDefaultAddress(int userId, int addressId);
    Task<ServiceResponse<bool>> DeleteAddress(int userId, int addressId);
}
