namespace backend.Features.Settlements.Entities;

public class Settlement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string SettlementCode { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
    public Guid? LotId { get; set; }
    public string? LotNumber { get; set; }
    public Guid? FarmerId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public string? FarmerPhone { get; set; }
    public string BuyerName { get; set; } = string.Empty;
    public string BuyerType { get; set; } = string.Empty;
    public string MilletType { get; set; } = string.Empty;
    public decimal QuantityKg { get; set; }
    public decimal PricePerKg { get; set; }
    public decimal GrossAmount { get; set; }
    public decimal FpoMargin { get; set; }
    public decimal TransportCost { get; set; }
    public decimal OtherCharges { get; set; }
    public decimal FinalAmount { get; set; }
    public string Status { get; set; } = "Pending Settlement"; // Pending Settlement, Paid, Awaiting Delivery
    public string? PaymentMethod { get; set; }
    public string? RazorpayPaymentLinkId { get; set; }
    public string? RazorpayShortUrl { get; set; }
    public string? TransactionId { get; set; }
    public DateTime? PaymentDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
