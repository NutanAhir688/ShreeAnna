namespace backend.Features.Warehouses.Entities;

public class Warehouse
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string WarehouseCode { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public string ManagerName { get; set; } = string.Empty;

    public decimal CapacityInTons { get; set; }

    public decimal UtilizedCapacityTons { get; set; }

    public string Status { get; set; } = "ACTIVE";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
