using System;

namespace backend.Features.Procurement.DTOs;

public record CreatePurchaseRequestDto(
    string LotId,
    string MilletType,
    decimal RequestedQuantityKg,
    decimal IndicativePricePerKg,
    string? FpoName,
    string? ProcessorName,
    string? Notes
);

public record ProposeAgreementDto(
    decimal AgreedQuantityKg,
    decimal SellingPricePerKg,
    DateTime? AgreementValidUntil,
    string? PaymentTerms,
    string? OwnershipTransfer,
    string? CancellationTerms
);

public record ProcessPaymentDto(
    string PaymentMethod, // UPI, Bank Transfer, Card, MockGateway
    string? TransactionId,
    string? UpiId,
    string? DeliveryAddress = null,
    decimal? DestinationLatitude = null,
    decimal? DestinationLongitude = null
);

public record ConfirmProcessorDeliveryDto(
    string Otp,
    string? PhotoUrl,
    string? Notes
);

public record PurchaseRequestResponseDto(
    Guid Id,
    string RequestCode,
    string LotId,
    string MilletType,
    decimal RequestedQuantityKg,
    decimal IndicativePricePerKg,
    decimal IndicativeValue,
    string FpoName,
    string ProcessorId,
    string ProcessorName,
    DateTime SubmittedDate,
    string Status,
    string? AgreementId,
    decimal? AgreedQuantityKg,
    decimal? SellingPricePerKg,
    decimal? TotalValue,
    DateTime? AgreementValidUntil,
    string? PaymentTerms,
    string? OwnershipTransfer,
    string? CancellationTerms,
    string? PaymentStatus,
    string? PaymentMethod,
    string? PaymentTransactionId,
    DateTime? PaymentDate,
    string? InvoiceNumber,
    Guid? ShipmentId,
    string? DispatchCode,
    string? DeliveryChallanNumber,
    string? DeliveryOtp,
    string? DeliveryProofPhotoUrl,
    DateTime? DeliveredAt,
    string? DeliveryNotes,
    // Driver details if shipment created
    string? DriverName,
    string? DriverPhone,
    string? VehicleNumber,
    string? ShipmentStatus,
    decimal? DriverLatitude,
    decimal? DriverLongitude
);
