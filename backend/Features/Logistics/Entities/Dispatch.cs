namespace backend.Features.Logistics.Entities;

using backend.Features.Warehouses.Entities;

public class Dispatch
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string DispatchCode { get; set; } = string.Empty;
    public string Direction { get; set; } = "INBOUND"; // INBOUND or OUTBOUND

    public Guid? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public string AgreementId { get; set; } = string.Empty;
    public string LotId { get; set; } = string.Empty;
    public string BatchId { get; set; } = string.Empty;
    public string FarmerOrProcessorName { get; set; } = string.Empty;
    public string ProcessorType { get; set; } = string.Empty;
    public string MilletType { get; set; } = string.Empty;

    public string SourceAddress { get; set; } = string.Empty;
    public string DestinationAddress { get; set; } = string.Empty;

    public string TransportResponsibility { get; set; } = "FPO Pickup";
    public string VehicleNumber { get; set; } = string.Empty;
    public decimal VehicleCapacityKg { get; set; } = 7000;
    public string DriverName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;

    public decimal TotalQuantityKg { get; set; }
    public decimal? FinalReceivedQuantityKg { get; set; }
    public decimal? WarehouseStockAfterDispatchKg { get; set; }

    public string Status { get; set; } = "SCHEDULED"; // SCHEDULED, VEHICLE_ASSIGNED, IN_TRANSIT, DELIVERED, AWAITING_WAREHOUSE_RECEIPT
    public string WarehouseReceiptStatus { get; set; } = "PENDING"; // PENDING, GENERATED

    public DateTime ScheduledDate { get; set; } = DateTime.UtcNow;
    public string ScheduledStartTime { get; set; } = "09:00 AM";
    public string ScheduledEndTime { get; set; } = "11:00 AM";
    public string SpecialInstructions { get; set; } = string.Empty;

    public DateTime? DeliveredDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
