namespace backend.Features.Procurement.Entities;

using backend.Features.Farmers.Entities;
using backend.Features.Farms.Entities;

public class ProcurementLot
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string LotNumber { get; set; } = string.Empty;

    public Guid FarmerId { get; set; }
    public Farmer Farmer { get; set; } = null!;

    public Guid FarmId { get; set; }
    public Farm Farm { get; set; } = null!;

    public string MilletType { get; set; } = string.Empty;

    public decimal EstimatedQuantityKg { get; set; }

    public decimal? ActualQuantityKg { get; set; }

    public DateTime HarvestDate { get; set; }

    public DateTime SubmissionDate { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "SUBMITTED";

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
