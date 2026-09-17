using backend.Features.Farms.DTOs;

namespace backend.Features.Farms.Services;

public interface IFarmService
{
    Task<FarmResponse> CreateAsync(
        Guid farmerId,
        CreateFarmRequest request);

    Task<List<FarmResponse>> GetByFarmerIdAsync(
        Guid farmerId);

    Task<List<FarmResponse>> GetAllAsync();

    Task<FarmResponse?> GetByIdAsync(
        Guid farmId);

    Task<FarmResponse?> UpdateAsync(
        Guid farmId,
        UpdateFarmRequest request);

    Task<bool> DeleteAsync(
        Guid farmId);

    Task<bool> ArchiveAsync(
        Guid farmId);

    Task<FarmResponse?> UpdateStatusAsync(
        Guid farmId,
        string status,
        string? verifiedBy = null);
}