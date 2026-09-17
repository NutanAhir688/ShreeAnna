namespace backend.Features.Quality.DTOs;

public record CreateInspectionRequest(
    Guid LotId,
    string InspectorName,
    decimal MoisturePercentage,
    decimal PurityPercentage,
    string Grade,
    string Status,
    string Notes
);

public record InspectionResponse(
    Guid Id,
    Guid LotId,
    string LotNumber,
    string InspectorName,
    decimal MoisturePercentage,
    decimal PurityPercentage,
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
    string Grade
);
