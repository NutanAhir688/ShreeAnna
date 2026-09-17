namespace backend.Features.Logistics.DTOs;

public record CreateDispatchRequest(
    Guid WarehouseId,
    string DestinationAddress,
    string VehicleNumber,
    string DriverName,
    string DriverPhone,
    decimal TotalQuantityKg,
    DateTime ScheduledDate
);

public record DispatchResponse(
    Guid Id,
    string DispatchCode,
    Guid WarehouseId,
    string WarehouseName,
    string DestinationAddress,
    string VehicleNumber,
    string DriverName,
    string DriverPhone,
    decimal TotalQuantityKg,
    string Status,
    DateTime ScheduledDate,
    DateTime? DeliveredDate
);
