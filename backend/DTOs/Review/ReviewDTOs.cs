using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Review;

public class CreateReviewDTO
{
    [Required]
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5 stars.")]
    public int Rating { get; set; } = 5;

    [Required]
    [MaxLength(150, ErrorMessage = "Review title cannot exceed 150 characters.")]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000, ErrorMessage = "Review comment cannot exceed 2000 characters.")]
    public string Comment { get; set; } = string.Empty;
}

public class GetReviewDTO
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserAvatar { get; set; }
    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public bool IsVerifiedPurchase { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ProductReviewSummaryDTO
{
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public Dictionary<int, int> RatingDistribution { get; set; } = new();
    public List<GetReviewDTO> Reviews { get; set; } = new();
    public bool CanReview { get; set; } = true;
    public bool HasReviewed { get; set; } = false;
    public bool IsVerifiedBuyer { get; set; } = false;
}
