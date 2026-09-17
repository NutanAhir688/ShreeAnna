namespace backend.Features.Logistics.Entities;

using backend.Features.Warehouses.Entities;

public class Dispatch
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string DispatchCode { get; set; } = string.Empty;

    public Guid WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;

    public string DestinationAddress { get; set; } = string.Empty;

    public string VehicleNumber { get; set; } = string.Empty;

    public string DriverName { get; set; } = string.Empty;

    public string DriverPhone { get; set; } = string.Empty;

    public decimal TotalQuantityKg { get; set; }

    public string Status { get; set; } = "PENDING"; // PENDING, IN_TRANSIT, DELIVERED, CANCELLED

    public DateTime ScheduledDate { get; set; } = DateTime.UtcNow;

    public DateTime? DeliveredDate { get; set; }
}
