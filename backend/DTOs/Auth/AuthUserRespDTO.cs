using System;
using backend.Models;

namespace backend.DTOs.Auth;

public class AuthUserRespDTO : BaseModel
{
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer";
}