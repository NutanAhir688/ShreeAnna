using backend.Features.Marketplace.DTOs;

namespace backend.Features.Marketplace.Services;

public interface IMarketplaceService
{
    Task<List<ProductResponse>> GetAllAsync(string? status = null, string? search = null);
    Task<ProductResponse?> GetByIdAsync(Guid id);
    Task<ProductResponse> CreateAsync(CreateProductRequest request, Guid? userId = null);
    Task<ProductResponse?> UpdateAsync(Guid id, UpdateProductRequest request);
    Task<ProductResponse?> UpdateStatusAsync(Guid id, string status);
    Task<bool> DeleteAsync(Guid id);
}
