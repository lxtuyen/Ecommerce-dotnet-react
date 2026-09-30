using System.Threading.Tasks;
using backend.DTOs.Payment;
using backend.Models;

namespace backend.Services;

public interface IPaymentService
{
    Task<ServiceResponse<PaymentIntentResponseDTO>> CreatePaymentIntent(CreatePaymentIntentDTO request, int userId);
    ServiceResponse<StripeConfigDTO> GetStripeConfig();
    Task<ServiceResponse<bool>> HandleWebhookEvent(string json, string stripeSignature);
}
