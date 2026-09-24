using Microsoft.Extensions.Configuration;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using backend.Data;
using backend.DTOs.Auth;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services.Impl
{
    public class AuthService : IAuthService
    {
        private readonly IMapper _mapper;
        private readonly DataContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(IMapper mapper, DataContext context, IConfiguration configuration)
        {
            _mapper = mapper;
            _context = context;
            _configuration = configuration;
        }

        public async Task<ServiceResponse<AuthUserRespDTO>> Login(AuthUserReqDTO request)
        {
            var serviceResponse = new ServiceResponse<AuthUserRespDTO>();
            try
            {
                var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (dbUser == null)
                {
                    serviceResponse.Success = false;
                    serviceResponse.Message = "Email not found.";
                    return serviceResponse;
                }

                if (!BCrypt.Net.BCrypt.Verify(request.Password, dbUser.Password))
                {
                    serviceResponse.Success = false;
                    serviceResponse.Message = "Wrong password.";
                    return serviceResponse;
                }

                var token = GenerateToken(dbUser);
                var authResponse = new AuthUserRespDTO
                {
                    Token = token,
                    UserId = dbUser.Id,
                    Name = dbUser.Name,
                    Email = dbUser.Email,
                    Initials = dbUser.Initials,
                    Role = dbUser.Role.ToString()
                };
                serviceResponse.Data = authResponse;
                serviceResponse.Message = "Login successful.";
            }
            catch (Exception ex)
            {
                serviceResponse.Success = false;
                serviceResponse.Message = ex.Message;
            }

            return serviceResponse;
        }

        private string GenerateToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenKeyString = _configuration["AppSettings:Token"] ?? "Ecommerce_Super_Secret_Key_For_Jwt_Auth_Token_2026_Enterprise_Secure_Key_!@#$";
            var tokenKey = Encoding.UTF8.GetBytes(tokenKeyString);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(tokenKey), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
