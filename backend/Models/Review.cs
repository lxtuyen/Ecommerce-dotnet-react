using System;

namespace backend.Models;

public class Review : BaseModel
{
    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserAvatar { get; set; }

    public int Rating { get; set; } = 5; // 1 - 5 stars
    public string Title { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public bool IsVerifiedPurchase { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
