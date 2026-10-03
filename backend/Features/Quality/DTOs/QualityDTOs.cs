namespace backend.Features.Quality.DTOs;
using System.ComponentModel.DataAnnotations;

public record CreateInspectionRequest(
    [Required] Guid LotId,
    [Required] string InspectorName,
    [Range(0, 100)] decimal MoisturePercentage,
    [Range(0, 100)] decimal PurityPercentage,
    decimal? ForeignMatterPercentage,
    decimal? DamagedGrainsPercentage,
    decimal? ImmatureGrainsPercentage,
    string? InsectDamage,
    [Required] string Grade,
    [Required] string Status,
    string? Notes
);

public record InspectionResponse(
    Guid Id,
    Guid LotId,
    string LotNumber,
    string InspectorName,
    decimal MoisturePercentage,
    decimal PurityPercentage,
    decimal? ForeignMatterPercentage,
    decimal? DamagedGrainsPercentage,
    decimal? ImmatureGrainsPercentage,
    string? InsectDamage,
    string Grade,
    string Status,
    string Notes,
    DateTime InspectionDate
);

public record QualityCertificateResponse(
    Guid Id,
    string CertificateNumber,
    Guid LotId,
    string LotNumber,
    string IssuedBy,
    DateTime IssueDate,
    DateTime ValidUntil,
    string Grade,
    string? FarmerName,
    string? MilletType,
    decimal? EstimatedQuantityKg,
    decimal? MoisturePercentage,
    decimal? PurityPercentage,
    decimal? ForeignMatterPercentage,
    decimal? DamagedGrainsPercentage,
    decimal? ImmatureGrainsPercentage,
    string? InsectDamage,
    string? Notes
);