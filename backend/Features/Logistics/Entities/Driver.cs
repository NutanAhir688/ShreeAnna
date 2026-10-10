namespace backend.Features.Logistics.Entities;

public class Driver
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DriverCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string VehicleNumber { get; set; } = string.Empty;
    public decimal VehicleCapacityKg { get; set; } = 7000;
    public string Status { get; set; } = "AVAILABLE"; // AVAILABLE, ON_JOURNEY, OFF_DUTY
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
