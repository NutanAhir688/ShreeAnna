namespace backend.Features.Procurement.DTOs;

public record CreateLotRequest(
    Guid FarmId,
    Guid FarmCropId,
    decimal EstimatedQuantityKg,
    DateTime HarvestDate,
    string? Description
);

public record AssignInspectorRequest(
    Guid? InspectorId,
    string InspectorName,
    string InspectorPhone,
    DateTime ScheduledDate
);

public record UpdateInspectorLocationRequest(
    string TrackingStatus,
    decimal? Latitude,
    decimal? Longitude
);

public record LotResponse(
    Guid Id,
    string LotNumber,
    Guid FarmerId,
    string FarmerName,
    Guid FarmId,
    string FarmName,
    string FarmCrop,
    decimal EstimatedQuantityKg,
    decimal? ActualQuantityKg,
    DateTime HarvestDate,
    DateTime SubmissionDate,
    string Status,
    string? Description,
    string? AssignedInspectorName,
    string? AssignedInspectorPhone,
    DateTime? ScheduledInspectionDate,
    string? InspectionTrackingStatus,
    decimal? InspectorLatitude,
    decimal? InspectorLongitude,
    DateTime? InspectorLastUpdated,
    decimal? FarmLatitude,
    decimal? FarmLongitude,
    string? FarmerPhone,
    string? FarmerAddress,
    decimal? OfferedPricePerKg,
    decimal? AgreedQuantityKg,
    string? AgreementVersion,
    decimal? LogisticsCost,
    decimal? OtherAdjustments,
    string? NegotiationRemarks,
    string? DriverName,
    string? DriverPhone,
    string? VehicleNumber,
    string? VerificationCode
);

public record FormulateAgreementRequest(
    decimal AgreedQuantityKg,
    decimal UnitPrice,
    string? LogisticsType,
    decimal? LogisticsCost,
    decimal? OtherAdjustments,
    string? Remarks
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

public record InspectorResponse(
    Guid Id,
    string Name,
    string Phone,
    string Role,
    string Email
);

