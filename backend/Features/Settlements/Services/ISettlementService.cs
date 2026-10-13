using backend.Features.Settlements.DTOs;

namespace backend.Features.Settlements.Services;

public interface ISettlementService
{
    Task<List<SettlementResponse>> GetAllAsync(string? status = null);
    Task<SettlementResponse?> GetByIdAsync(Guid id);
    Task<SettlementStatsResponse> GetStatsAsync();
    Task<CreatePaymentLinkResponse> CreatePaymentLinkAsync(Guid settlementId);
    Task<SettlementResponse> ProcessPaymentAsync(Guid settlementId, ProcessPaymentRequest request);
    Task<SettlementResponse> UpdateStatusAsync(Guid settlementId, string status);
    Task SyncFromProcurementLotsAsync();
}
