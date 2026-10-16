using System;

namespace backend.Features.Procurement.Entities;

public class PurchaseRequest
{
    public Guid Id { get; set; }
    public string RequestCode { get; set; } = string.Empty; // e.g. "PR-2026-001"
    public string LotId { get; set; } = string.Empty; // e.g. "LOT-2026-004"
    public string MilletType { get; set; } = string.Empty; // e.g. "Pearl Millet"
    public decimal RequestedQuantityKg { get; set; }
    public decimal IndicativePricePerKg { get; set; }
    public decimal IndicativeValue { get; set; }
    public string FpoName { get; set; } = "Mandya FPO";
    public string ProcessorId { get; set; } = string.Empty;
    public string ProcessorName { get; set; } = "Millet Shakti SHG";
    public DateTime SubmittedDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "REQUESTED"; 
    // Status values: "REQUESTED", "UNDER_NEGOTIATION", "AGREEMENT_PROPOSED", "ACCEPTED", "REJECTED", "PAID", "DISPATCHED", "DELIVERED"
    
    // Agreement Terms & Proposal
    public string? AgreementId { get; set; } // e.g. "PPA-2026-004"
    public decimal? AgreedQuantityKg { get; set; }
    public decimal? SellingPricePerKg { get; set; }
    public decimal? TotalValue { get; set; }
    public DateTime? AgreementValidUntil { get; set; }
    public string? PaymentTerms { get; set; } = "100% advance before dispatch";
    public string? OwnershipTransfer { get; set; } = "After payment confirmation and delivery";
    public string? CancellationTerms { get; set; } = "Subject to agreement terms";

    // Payment Processing
    public string? PaymentStatus { get; set; } = "PENDING";
    public string? PaymentMethod { get; set; } // UPI, Bank Transfer, Card
    public string? PaymentTransactionId { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? InvoiceNumber { get; set; } // e.g. "INV-2026-004"

    // Logistics & Dispatch
    public Guid? ShipmentId { get; set; }
    public string? DispatchCode { get; set; }
    public string? DeliveryChallanNumber { get; set; } // e.g. "DC-2026-004"
    public string? DeliveryOtp { get; set; } = "9304";
    public string? DeliveryProofPhotoUrl { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public string? DeliveryNotes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
