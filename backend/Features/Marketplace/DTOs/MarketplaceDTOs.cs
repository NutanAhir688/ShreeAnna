namespace backend.Features.Marketplace.DTOs;

public record CreateProductRequest(
    string Title,
    string? Category,
    string? Brand,
    string? Description,
    string? LotId,
    string? MilletType,
    string? FarmerName,
    decimal? QuantityKg,
    decimal? PricePerKg,
    string? Status,
    string? ImageUrl
);

public record UpdateProductRequest(
    string Title,
    string? Category,
    string? Brand,
    string? Description,
    string? LotId,
    string? MilletType,
    string? FarmerName,
    decimal? QuantityKg,
    decimal? PricePerKg,
    string? Status,
    string? ImageUrl
);

public record UpdateProductStatusRequest(
    string Status
);

public record ProductResponse(
    Guid Id,
    string Title,
    string Category,
    string Brand,
    string? Description,
    string? LotId,
    string? MilletType,
    string? FarmerName,
    decimal? QuantityKg,
    decimal? PricePerKg,
    string Status,
    string? ImageUrl,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
