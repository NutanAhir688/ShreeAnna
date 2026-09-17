namespace backend.Features.Inventory.Entities;

using backend.Features.Procurement.Entities;
using backend.Features.Warehouses.Entities;

public class InventoryBatch
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string BatchCode { get; set; } = string.Empty;

    public Guid? LotId { get; set; }
    public ProcurementLot? Lot { get; set; }

    public Guid WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;

    public string MilletType { get; set; } = string.Empty;

    public decimal QuantityInKg { get; set; }

    public string Grade { get; set; } = "A";

    public string Status { get; set; } = "IN_STOCK";

    public DateTime ReceivedDate { get; set; } = DateTime.UtcNow;
}

public class StockMovement
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string MovementCode { get; set; } = string.Empty;

    public Guid BatchId { get; set; }
    public InventoryBatch Batch { get; set; } = null!;

    public string MovementType { get; set; } = "INBOUND"; // INBOUND, OUTBOUND, TRANSFER

    public decimal QuantityKg { get; set; }

    public string FromLocation { get; set; } = string.Empty;

    public string ToLocation { get; set; } = string.Empty;

    public DateTime MovementDate { get; set; } = DateTime.UtcNow;
}
