using backend.Data;
using backend.Features.Marketplace.DTOs;
using backend.Features.Marketplace.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Marketplace.Services;

public class MarketplaceService : IMarketplaceService
{
    private readonly AppDbContext _context;
    private readonly ILogger<MarketplaceService> _logger;

    public MarketplaceService(AppDbContext context, ILogger<MarketplaceService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<ProductResponse>> GetAllAsync(string? status = null, string? search = null)
    {
        var query = _context.MarketplaceProducts
            .AsNoTracking()
            .Where(p => !p.IsDeleted);

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(p => p.Status.ToLower() == status.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p =>
                p.Title.ToLower().Contains(term) ||
                (p.Category != null && p.Category.ToLower().Contains(term)) ||
                (p.Brand != null && p.Brand.ToLower().Contains(term)) ||
                (p.LotId != null && p.LotId.ToLower().Contains(term)) ||
                (p.MilletType != null && p.MilletType.ToLower().Contains(term)));
        }

        var list = await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return list.Select(MapToResponse).ToList();
    }

    public async Task<ProductResponse?> GetByIdAsync(Guid id)
    {
        var product = await _context.MarketplaceProducts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

        return product == null ? null : MapToResponse(product);
    }

    public async Task<ProductResponse> CreateAsync(CreateProductRequest request, Guid? userId = null)
    {
        var product = new MarketplaceProduct
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Category = request.Category ?? "Flours & Grains",
            Brand = request.Brand ?? "ShreeAnna Organics",
            Description = request.Description,
            LotId = request.LotId,
            MilletType = request.MilletType,
            FarmerName = request.FarmerName,
            QuantityKg = request.QuantityKg,
            PricePerKg = request.PricePerKg,
            Status = string.IsNullOrWhiteSpace(request.Status) ? "Active" : request.Status,
            ImageUrl = request.ImageUrl,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        _context.MarketplaceProducts.Add(product);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Created marketplace product {Id} - {Title}", product.Id, product.Title);

        return MapToResponse(product);
    }

    public async Task<ProductResponse?> UpdateAsync(Guid id, UpdateProductRequest request)
    {
        var product = await _context.MarketplaceProducts.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
        if (product == null) return null;

        product.Title = request.Title;
        if (request.Category != null) product.Category = request.Category;
        if (request.Brand != null) product.Brand = request.Brand;
        product.Description = request.Description;
        if (request.LotId != null) product.LotId = request.LotId;
        if (request.MilletType != null) product.MilletType = request.MilletType;
        if (request.FarmerName != null) product.FarmerName = request.FarmerName;
        if (request.QuantityKg.HasValue) product.QuantityKg = request.QuantityKg;
        if (request.PricePerKg.HasValue) product.PricePerKg = request.PricePerKg;
        if (!string.IsNullOrWhiteSpace(request.Status)) product.Status = request.Status;
        if (request.ImageUrl != null) product.ImageUrl = request.ImageUrl;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Updated marketplace product {Id}", id);

        return MapToResponse(product);
    }

    public async Task<ProductResponse?> UpdateStatusAsync(Guid id, string status)
    {
        var product = await _context.MarketplaceProducts.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
        if (product == null) return null;

        product.Status = status;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        _logger.LogInformation("Updated status of marketplace product {Id} to {Status}", id, status);

        return MapToResponse(product);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var product = await _context.MarketplaceProducts.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
        if (product == null) return false;

        product.IsDeleted = true;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        _logger.LogInformation("Soft-deleted marketplace product {Id}", id);

        return true;
    }

    private static ProductResponse MapToResponse(MarketplaceProduct p) => new(
        p.Id,
        p.Title,
        p.Category,
        p.Brand,
        p.Description,
        p.LotId,
        p.MilletType,
        p.FarmerName,
        p.QuantityKg,
        p.PricePerKg,
        p.Status,
        p.ImageUrl,
        p.CreatedAt,
        p.UpdatedAt
    );
}
