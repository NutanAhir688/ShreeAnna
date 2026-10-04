namespace backend.Features.Warehouses.DTOs;

public record CreateWarehouseRequest(
    string Name,
    string Location,
    string District,
    string Taluka,
    string Village,
    string ManagerName,
    string ContactPhone,
    decimal CapacityInTons,
    decimal UtilizedCapacityTons,
    decimal? Latitude,
    decimal? Longitude,
    string? StorageCondition
);

public record WarehouseResponse(
    Guid Id,
    string WarehouseCode,
    string Name,
    string Location,
    string District,
    string Taluka,
    string Village,
    string ManagerName,
    string ContactPhone,
    decimal CapacityInTons,
    decimal UtilizedCapacityTons,
    decimal? Latitude,
    decimal? Longitude,
    string StorageCondition,
    string Status,
    DateTime CreatedAt
);

public record CreateWarehouseReceiptRequest(
    string DispatchId,
    decimal ActualReceivedQuantityKg,
    string ConditionOnArrival, // Good, Damaged, Wet, Other
    string? ReceivingNotes,
    string? StorageZone,
    string? StorageBin,
    string? DocumentUrl,
    string? ReceivingPhotoUrl,
    bool IsDraft = false
);

public record WarehouseReceiptResponse(
    Guid ReceiptId,
    string ReceiptNumber,
    string DispatchId,
    string ShipmentCode,
    string? LotId,
    string? FarmerName,
    string? MilletType,
    decimal ExpectedQuantityKg,
    decimal ActualReceivedQuantityKg,
    decimal VarianceKg,
    decimal UnitPrice,
    decimal TotalPayableAmount,
    string ReceiptStatus, // FULLY RECEIVED, RECEIVED WITH VARIANCE, DRAFT
    string ConditionOnArrival,
    string? StorageZone,
    string? StorageBin,
    string? WarehouseName,
    string? Notes,
    DateTime ReceivedAt
);

public record AllocateLotRequest(
    string LotId,
    Guid WarehouseId,
    decimal Quantity,
    string StorageSection,
    string? Remarks
);

public record LotAllocationResponse(
    Guid AllocationId,
    string LotId,
    Guid WarehouseId,
    string WarehouseName,
    decimal QuantityKg,
    string StorageSection,
    string Status,
    DateTime AllocatedAt
);

