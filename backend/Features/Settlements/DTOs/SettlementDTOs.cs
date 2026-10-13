namespace backend.Features.Settlements.DTOs;

public class SettlementResponse
{
    public Guid Id { get; set; }
    public string SettlementCode { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
    public string BuyerName { get; set; } = string.Empty;
    public string BuyerType { get; set; } = string.Empty;
    public string FarmerName { get; set; } = string.Empty;
    public string FarmerId { get; set; } = string.Empty;
    public string? FarmerPhone { get; set; }
    public string LotId { get; set; } = string.Empty;
    public string Millet { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = "kg";
    public decimal PricePerKg { get; set; }
    public decimal GrossAmount { get; set; }
    public decimal ProcurementAmount { get; set; }
    public decimal FpoMargin { get; set; }
    public decimal TransportCost { get; set; }
    public decimal OtherCharges { get; set; }
    public decimal FinalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public string? PaymentDate { get; set; }
    public string? DeliveryDate { get; set; }
    public string? RazorpayPaymentLinkId { get; set; }
    public string? RazorpayShortUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SettlementStatsResponse
{
    public decimal TotalSettlementValue { get; set; }
    public decimal PendingSettlementValue { get; set; }
    public decimal PaidSettlementValue { get; set; }
    public decimal FpoMargin { get; set; }
    public int TotalCount { get; set; }
    public int PendingCount { get; set; }
    public int PaidCount { get; set; }
}

public class CreatePaymentLinkResponse
{
    public string PaymentLinkId { get; set; } = string.Empty;
    public string ShortUrl { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class ProcessPaymentRequest
{
    public string? PaymentMethod { get; set; } = "Card";
    public string? CardNumber { get; set; }
    public string? CardholderName { get; set; }
    public string? ExpiryDate { get; set; }
    public string? Cvv { get; set; }
    public string? UpiId { get; set; }
    public bool SimulateSuccess { get; set; } = true;
}

public class UpdateSettlementStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
