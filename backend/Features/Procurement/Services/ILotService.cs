using backend.Features.Procurement.DTOs;

namespace backend.Features.Procurement.Services;

public interface ILotService
{
    Task<List<LotResponse>> GetAllAsync();
    Task<List<LotResponse>> GetByFarmerIdAsync(Guid farmerId);
    Task<LotResponse?> GetByIdAsync(Guid id);
    Task<LotResponse> CreateAsync(Guid farmerId, CreateLotRequest request);
    Task<LotResponse?> AssignInspectorAsync(Guid lotId, AssignInspectorRequest request);
    Task<LotResponse?> UpdateInspectorLocationAsync(Guid lotId, UpdateInspectorLocationRequest request);
    Task<LotTimelineResponse?> GetTimelineAsync(Guid lotId);
    Task<bool> CreateAgreementAsync(Guid lotId, FormulateAgreementRequest? request);
    Task<bool> AcceptAgreementAsync(Guid lotId, bool isFarmer = false);
    Task<bool> RejectAgreementAsync(Guid lotId, RejectAgreementRequest request, bool isFarmer = false);
    Task<bool> ReschedulePickupAsync(Guid lotId, ReschedulePickupRequest request);
    Task<List<InspectorResponse>> GetInspectorsAsync();
    Task<bool> RecordDriverLocationAsync(string lotId, RecordDriverLocationRequest request, System.Security.Claims.ClaimsPrincipal user);
    Task<DriverLocationResponse?> GetDriverLocationAsync(string lotId, System.Security.Claims.ClaimsPrincipal user);
}

