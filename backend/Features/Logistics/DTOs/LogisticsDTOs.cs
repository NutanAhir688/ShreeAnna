namespace backend.Features.Logistics.DTOs;

public record CreateDispatchRequest(
    string Direction,
    Guid? WarehouseId,
    string? AgreementId,
    string? LotId,
    string? BatchId,
    string? FarmerOrProcessorName,
    string? ProcessorType,
    string? MilletType,
    string? SourceAddress,
    string? DestinationAddress,
    string? TransportResponsibility,
    string? VehicleNumber,
    decimal? VehicleCapacityKg,
    string? DriverName,
    string? DriverPhone,
    decimal TotalQuantityKg,
    DateTime ScheduledDate,
    string? ScheduledStartTime,
    string? ScheduledEndTime,
    string? SpecialInstructions
);

public record DispatchResponse(
    Guid Id,
    string DispatchCode,
    string Direction,
    Guid? WarehouseId,
    string WarehouseName,
    string AgreementId,
    string LotId,
    string BatchId,
    string FarmerOrProcessorName,
    string ProcessorType,
    string MilletType,
    string SourceAddress,
    string DestinationAddress,
    string TransportResponsibility,
    string VehicleNumber,
    decimal VehicleCapacityKg,
    string DriverName,
    string DriverPhone,
    string VerificationCode,
    decimal TotalQuantityKg,
    decimal? FinalReceivedQuantityKg,
    decimal? WarehouseStockAfterDispatchKg,
    string Status,
    string WarehouseReceiptStatus,
    DateTime ScheduledDate,
    string ScheduledStartTime,
    string ScheduledEndTime,
    string SpecialInstructions,
    DateTime? DeliveredDate,
    DateTime CreatedAt
);

public record ConfirmDeliveryRequest(
    DateTime? DeliveryDate,
    string? DeliveryTime,
    decimal DeliveredQuantityKg,
    string? DeliveryCondition,
    string? DeliveryNotes,
    string? DeliveryProofUrl,
    bool IsVehicleNumberVerified,
    bool IsDriverIdentityVerified,
    bool IsDestinationVerified,
    bool IsMilletDelivered,
    bool IsDeliveryProofCollected
);

public record ReportIssueRequest(
    string ReferenceType,
    string ReferenceId,
    string? FarmerName,
    string? DriverName,
    string IssueCategory,
    DateTime IncidentDateTime,
    string PriorityLevel,
    string Subject,
    string DetailedDescription,
    List<string>? AttachmentUrls
);

public record ShipmentIssueResponse(
    Guid Id,
    Guid? DispatchId,
    string ReferenceType,
    string ReferenceId,
    string FarmerName,
    string DriverName,
    string IssueCategory,
    DateTime IncidentDateTime,
    string PriorityLevel,
    string Subject,
    string DetailedDescription,
    List<string> AttachmentUrls,
    string Status,
    DateTime ReportedAt
);
