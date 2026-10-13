namespace backend.Features.Logistics.Entities;

public class DriverLocationLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LotId { get; set; }
    public string DriverIdOrPhone { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public decimal? AccuracyMeters { get; set; }
    public DateTime RecordedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
