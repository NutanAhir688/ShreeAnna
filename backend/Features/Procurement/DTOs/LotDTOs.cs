namespace backend.Features.Procurement.DTOs;

public record CreateLotRequest(
    Guid FarmId,
    string MilletType,
    decimal EstimatedQuantityKg,
    DateTime HarvestDate,
    string? Description
);

public record LotResponse(
    Guid Id,
    string LotNumber,
    Guid FarmerId,
    string FarmerName,
    Guid FarmId,
    string FarmName,
    string MilletType,
    decimal EstimatedQuantityKg,
    decimal? ActualQuantityKg,
    DateTime HarvestDate,
    DateTime SubmissionDate,
    string Status,
    string? Description
);

public record LotTimelineStepResponse(
    string Step,
    string Status,
    DateTime? CompletedAt
);

public record LotTimelineResponse(
    Guid LotId,
    string CurrentStatus,
    List<LotTimelineStepResponse> Steps
);

public record RejectAgreementRequest(
    string Reason,
    string? Comment
);

public record ReschedulePickupRequest(
    DateTime RequestedDate,
    string Reason
);
