using System.ComponentModel.DataAnnotations;

namespace backend.Features.Farms.DTOs;
using backend.Features.Farms.DTOs;

public class CreateFarmRequest
{
    [Required]
    public string FarmName { get; set; } = string.Empty;

    [Range(0.01, 100000)]
    public decimal AreaInAcres { get; set; }

    [Required]
    public string SoilType { get; set; } = string.Empty;

    [Required]
    public string SurveyNumber { get; set; } = string.Empty;

    [Required]
    public string District { get; set; } = string.Empty;

    [Required]
    public string Taluka { get; set; } = string.Empty;

    [Required]
    public string Village { get; set; } = string.Empty;

    public decimal Latitude { get; set; }

    public decimal Longitude { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public List<CreateFarmCropRequest> Crops { get; set; } = new();
}