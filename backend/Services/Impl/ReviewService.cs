using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs.Review;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Impl;

public class ReviewService : IReviewService
{
    private readonly DataContext _context;

    public ReviewService(DataContext context)
    {
        _context = context;
    }

    public async Task<ServiceResponse<ProductReviewSummaryDTO>> GetProductReviews(int productId, int? currentUserId)
    {
        var response = new ServiceResponse<ProductReviewSummaryDTO>();
        try
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
            if (product == null)
            {
                response.Success = false;
                response.Message = $"Product with ID {productId} not found.";
                return response;
            }

            var reviews = await _context.Reviews
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var distribution = new Dictionary<int, int>
            {
                { 5, reviews.Count(r => r.Rating == 5) },
                { 4, reviews.Count(r => r.Rating == 4) },
                { 3, reviews.Count(r => r.Rating == 3) },
                { 2, reviews.Count(r => r.Rating == 2) },
                { 1, reviews.Count(r => r.Rating == 1) }
            };

            double avgRating = reviews.Count > 0 
                ? Math.Round(reviews.Average(r => r.Rating), 1) 
                : product.Rating;

            bool hasReviewed = false;
            bool isVerifiedBuyer = false;

            if (currentUserId.HasValue)
            {
                hasReviewed = reviews.Any(r => r.UserId == currentUserId.Value);
                isVerifiedBuyer = await _context.Orders
                    .AnyAsync(o => o.UserId == currentUserId.Value 
                                && o.Status != OrderStatus.Cancelled 
                                && o.OrderItems.Any(oi => oi.ProductId == productId));
            }

            var reviewDTOs = reviews.Select(r => new GetReviewDTO
            {
                Id = r.Id,
                ProductId = r.ProductId,
                UserId = r.UserId,
                UserName = r.UserName,
                UserAvatar = r.UserAvatar,
                Rating = r.Rating,
                Title = r.Title,
                Comment = r.Comment,
                IsVerifiedPurchase = r.IsVerifiedPurchase,
                CreatedAt = r.CreatedAt
            }).ToList();

            response.Data = new ProductReviewSummaryDTO
            {
                AverageRating = avgRating,
                TotalReviews = reviews.Count,
                RatingDistribution = distribution,
                Reviews = reviewDTOs,
                CanReview = currentUserId.HasValue,
                HasReviewed = hasReviewed,
                IsVerifiedBuyer = isVerifiedBuyer
            };
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    public async Task<ServiceResponse<GetReviewDTO>> AddOrUpdateReview(int productId, int userId, CreateReviewDTO dto)
    {
        var response = new ServiceResponse<GetReviewDTO>();
        try
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
            if (product == null)
            {
                response.Success = false;
                response.Message = $"Product with ID {productId} not found.";
                return response;
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                response.Success = false;
                response.Message = "User not found.";
                return response;
            }

            var isVerified = await _context.Orders
                .AnyAsync(o => o.UserId == userId 
                            && o.Status != OrderStatus.Cancelled 
                            && o.OrderItems.Any(oi => oi.ProductId == productId));

            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r => r.ProductId == productId && r.UserId == userId);

            Review review;
            if (existingReview != null)
            {
                // Update existing review
                existingReview.Rating = dto.Rating;
                existingReview.Title = dto.Title;
                existingReview.Comment = dto.Comment;
                existingReview.IsVerifiedPurchase = isVerified;
                existingReview.CreatedAt = DateTime.UtcNow;
                existingReview.UserName = user.Name;
                review = existingReview;
            }
            else
            {
                review = new Review
                {
                    ProductId = productId,
                    UserId = userId,
                    UserName = user.Name,
                    UserAvatar = user.Initials,
                    Rating = dto.Rating,
                    Title = dto.Title,
                    Comment = dto.Comment,
                    IsVerifiedPurchase = isVerified,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Reviews.Add(review);
            }

            await _context.SaveChangesAsync();

            // Recalculate average rating & count for Product
            var allReviews = await _context.Reviews.Where(r => r.ProductId == productId).ToListAsync();
            product.Rating = Math.Round(allReviews.Average(r => r.Rating), 1);
            product.ReviewCount = allReviews.Count;
            await _context.SaveChangesAsync();

            response.Data = new GetReviewDTO
            {
                Id = review.Id,
                ProductId = review.ProductId,
                UserId = review.UserId,
                UserName = review.UserName,
                UserAvatar = review.UserAvatar,
                Rating = review.Rating,
                Title = review.Title,
                Comment = review.Comment,
                IsVerifiedPurchase = review.IsVerifiedPurchase,
                CreatedAt = review.CreatedAt
            };
            response.Message = existingReview != null ? "Review updated successfully." : "Review submitted successfully.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    public async Task<ServiceResponse<bool>> DeleteReview(int reviewId, int userId, bool isAdmin)
    {
        var response = new ServiceResponse<bool>();
        try
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId);
            if (review == null)
            {
                response.Success = false;
                response.Message = "Review not found.";
                return response;
            }

            if (!isAdmin && review.UserId != userId)
            {
                response.Success = false;
                response.Message = "You do not have permission to delete this review.";
                return response;
            }

            int productId = review.ProductId;
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            // Recalculate Product Rating
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
            if (product != null)
            {
                var remainingReviews = await _context.Reviews.Where(r => r.ProductId == productId).ToListAsync();
                if (remainingReviews.Any())
                {
                    product.Rating = Math.Round(remainingReviews.Average(r => r.Rating), 1);
                    product.ReviewCount = remainingReviews.Count;
                }
                else
                {
                    product.Rating = 4.8;
                    product.ReviewCount = 0;
                }
                await _context.SaveChangesAsync();
            }

            response.Data = true;
            response.Message = "Review deleted successfully.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }
}
