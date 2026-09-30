using System.Threading.Tasks;
using backend.DTOs.Review;
using backend.Models;

namespace backend.Services;

public interface IReviewService
{
    Task<ServiceResponse<ProductReviewSummaryDTO>> GetProductReviews(int productId, int? currentUserId);
    Task<ServiceResponse<GetReviewDTO>> AddOrUpdateReview(int productId, int userId, CreateReviewDTO dto);
    Task<ServiceResponse<bool>> DeleteReview(int reviewId, int userId, bool isAdmin);
}
