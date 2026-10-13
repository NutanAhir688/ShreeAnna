namespace backend.Features.Settlements.Services;

public interface IRazorpayMockGatewayService
{
    Task<RazorpayPaymentLinkResult> CreatePaymentLinkAsync(
        decimal amountInRupees,
        string description,
        string referenceId,
        string? customerName = null,
        string? customerPhone = null);

    Task<RazorpayActionResult> CompletePaymentAsync(string paymentIdOrGuid, string status = "captured");

    Task<RazorpayPaymentLinkResult?> GetPaymentLinkAsync(string paymentLinkId);
}

public class RazorpayPaymentLinkResult
{
    public string Id { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string ShortUrl { get; set; } = string.Empty;
    public string ReferenceId { get; set; } = string.Empty;
    public string PaymentInternalId { get; set; } = string.Empty;
}

public class RazorpayActionResult
{
    public bool Success { get; set; }
    public string PaymentId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Resolution { get; set; } = string.Empty;
    public string? RedirectUrl { get; set; }
}
