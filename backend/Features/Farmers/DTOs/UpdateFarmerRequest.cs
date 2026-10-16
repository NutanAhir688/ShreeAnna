using System.ComponentModel.DataAnnotations;

namespace backend.Features.Farmers.DTOs;

public class UpdateFarmerRequest
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;

    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Address { get; set; } = string.Empty;

    [Required]
    public string District { get; set; } = string.Empty;

    [Required]
    public string Taluka { get; set; } = string.Empty;

    [Required]
    public string Village { get; set; } = string.Empty;

    [Required]
    public DateTime DateOfBirth { get; set; }

    public string? Status { get; set; }
}