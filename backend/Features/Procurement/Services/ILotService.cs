using backend.Features.Procurement.DTOs;

namespace backend.Features.Procurement.Services;

public interface ILotService
{
    Task<List<LotResponse>> GetAllAsync();
    Task<List<LotResponse>> GetByFarmerIdAsync(Guid farmerId);
    Task<LotResponse?> GetByIdAsync(Guid id);
    Task<LotResponse> CreateAsync(Guid farmerId, CreateLotRequest request);
    Task<LotTimelineResponse?> GetTimelineAsync(Guid lotId);
    Task<bool> AcceptAgreementAsync(Guid lotId);
    Task<bool> RejectAgreementAsync(Guid lotId, RejectAgreementRequest request);
    Task<bool> ReschedulePickupAsync(Guid lotId, ReschedulePickupRequest request);
}
