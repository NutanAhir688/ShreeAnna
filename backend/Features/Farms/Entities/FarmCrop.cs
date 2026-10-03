namespace backend.Features.Farms.Entities;

using backend.Features.Farmers.Entities;

public class FarmCrop
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FarmId { get; set; }

    public Farm Farm { get; set; } = null!;

    public string CropName { get; set; } = string.Empty;

    public string Season { get; set; } = string.Empty;

    public DateTime SowingDate { get; set; }

    public DateTime? ExpectedHarvestDate { get; set; }

    public decimal? EstimatedAreaInAcres { get; set; }

    public string Status { get; set; } = "Active";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
