namespace backend.Features.Inventory.DTOs;

public record InventoryBatchResponse(
    Guid Id,
    string BatchCode,
    Guid? LotId,
    string? LotNumber,
    Guid WarehouseId,
    string WarehouseName,
    string MilletType,
    decimal QuantityInKg,
    string Grade,
    string Status,
    DateTime ReceivedDate
);

public record StockMovementResponse(
    Guid Id,
    string MovementCode,
    Guid BatchId,
    string BatchCode,
    string MovementType,
    decimal QuantityKg,
    string FromLocation,
    string ToLocation,
    DateTime MovementDate
);

public record CreateStockMovementRequest(
    Guid BatchId,
    string MovementType,
    decimal QuantityKg,
    string FromLocation,
    string ToLocation
);
