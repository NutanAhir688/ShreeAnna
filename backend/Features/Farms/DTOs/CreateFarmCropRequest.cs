using System.ComponentModel.DataAnnotations;

namespace backend.Features.Farms.DTOs;

public class CreateFarmCropRequest
{
    [Required]
    public string CropName { get; set; } = string.Empty;

    [Required]
    public string Season { get; set; } = string.Empty;

    public DateTime SowingDate { get; set; }

    public DateTime? ExpectedHarvestDate { get; set; }

    [Range(0, 100000)]
    public decimal? EstimatedAreaInAcres { get; set; }
}