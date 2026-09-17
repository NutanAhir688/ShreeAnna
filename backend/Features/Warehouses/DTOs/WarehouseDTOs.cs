namespace backend.Features.Warehouses.DTOs;

public record CreateWarehouseRequest(
    string Name,
    string Location,
    string ManagerName,
    decimal CapacityInTons
);

public record WarehouseResponse(
    Guid Id,
    string WarehouseCode,
    string Name,
    string Location,
    string ManagerName,
    decimal CapacityInTons,
    decimal UtilizedCapacityTons,
    string Status,
    DateTime CreatedAt
);
