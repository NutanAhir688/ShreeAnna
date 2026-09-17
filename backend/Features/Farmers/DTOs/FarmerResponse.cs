namespace backend.Features.Farmers.DTOs;

public class FarmerResponse
{
    public Guid Id { get; set; }

    public string FarmerCode { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string District { get; set; } = string.Empty;

    public string Taluka { get; set; } = string.Empty;

    public string Village { get; set; } = string.Empty;

    public DateTime DateOfBirth { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public int FarmCount { get; set; }

    public decimal TotalLandInAcres { get; set; }
}