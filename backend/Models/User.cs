using System;
using System.Collections.Generic;

namespace backend.Models;

public class User : BaseModel
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
    public Role Role { get; set; } = Role.Customer;
    public Cart? Cart { get; set; }
    public List<Order> Orders { get; set; } = new();
}
