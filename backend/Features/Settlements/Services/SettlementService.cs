using backend.Data;
using backend.Features.Notifications.Services;
using backend.Features.Procurement.Entities;
using backend.Features.Settlements.DTOs;
using backend.Features.Settlements.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Settlements.Services;

public class SettlementService : ISettlementService
{
    private readonly AppDbContext _context;
    private readonly IRazorpayMockGatewayService _razorpayMockGateway;
    private readonly INotificationService _notificationService;
    private readonly ILogger<SettlementService> _logger;

    public SettlementService(
        AppDbContext context,
        IRazorpayMockGatewayService razorpayMockGateway,
        INotificationService notificationService,
        ILogger<SettlementService> logger)
    {
        _context = context;
        _razorpayMockGateway = razorpayMockGateway;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task SyncFromProcurementLotsAsync()
    {
        try
        {
            var lots = await _context.ProcurementLots
                .Include(p => p.Farmer)
                .Include(p => p.Farm)
                .Include(p => p.FarmCrop)
                .ToListAsync();

            var existingLotIds = await _context.Settlements
                .Where(s => s.LotId.HasValue)
                .Select(s => s.LotId!.Value)
                .ToListAsync();

            var existingLotSet = new HashSet<Guid>(existingLotIds);

            var candidateLots = lots.Where(l =>
                l.Status.ToUpper() == "STORED" ||
                l.Status.ToUpper() == "DELIVERED" ||
                l.Status.ToUpper() == "COMPLETED" ||
                l.Status.ToUpper() == "DISPATCHED" ||
                l.Status.ToUpper() == "PAYMENT_COMPLETED" ||
                l.Status.ToUpper() == "SETTLED"
            ).ToList();

            bool hasNew = false;
            foreach (var lot in candidateLots)
            {
                if (existingLotSet.Contains(lot.Id))
                    continue;

                decimal quantity = lot.ActualQuantityKg ?? lot.AgreedQuantityKg ?? lot.EstimatedQuantityKg;
                decimal price = lot.OfferedPricePerKg ?? 45m;
                decimal gross = quantity * price;
                decimal transport = lot.LogisticsCost ?? 0m;
                decimal adjustments = lot.OtherAdjustments ?? 0m;
                decimal margin = Math.Round(gross * 0.05m, 2);
                decimal final = Math.Max(0, gross - transport - adjustments);
                if (final == 0) final = gross;

                string status = "Pending Settlement";
                if (lot.Status.ToUpper() == "PAYMENT_COMPLETED" || lot.Status.ToUpper() == "SETTLED")
                {
                    status = "Paid";
                }

                var settlement = new Settlement
                {
                    Id = Guid.NewGuid(),
                    SettlementCode = $"SET-{lot.LotNumber}",
                    OrderId = $"ORD-{lot.LotNumber}",
                    LotId = lot.Id,
                    LotNumber = lot.LotNumber,
                    FarmerId = lot.FarmerId,
                    FarmerName = lot.Farmer?.FullName ?? "Registered Farmer",
                    FarmerPhone = lot.Farmer?.Phone,
                    BuyerName = "Anand Agri Producers FPO",
                    BuyerType = "FPO Procurement",
                    MilletType = lot.FarmCrop?.CropName ?? lot.Farm?.MilletType ?? "Millet",
                    QuantityKg = quantity,
                    PricePerKg = price,
                    GrossAmount = gross,
                    FpoMargin = margin,
                    TransportCost = transport,
                    OtherCharges = adjustments,
                    FinalAmount = final,
                    Status = status,
                    DeliveryDate = lot.HarvestDate,
                    CreatedAt = lot.SubmissionDate
                };

                _context.Settlements.Add(settlement);
                existingLotSet.Add(lot.Id);
                hasNew = true;
            }

            if (hasNew)
            {
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error syncing settlements from procurement lots");
        }
    }

    public async Task<List<SettlementResponse>> GetAllAsync(string? status = null)
    {
        await SyncFromProcurementLotsAsync();

        var query = _context.Settlements.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var clean = status.Trim().ToLowerInvariant();
            if (clean == "pending" || clean == "pending settlement")
            {
                query = query.Where(s => s.Status == "Pending Settlement" || s.Status == "Pending" || s.Status == "Awaiting Delivery");
            }
            else if (clean == "paid" || clean == "completed")
            {
                query = query.Where(s => s.Status == "Paid" || s.Status == "Completed");
            }
            else
            {
                query = query.Where(s => s.Status.ToLower() == clean);
            }
        }

        var list = await query
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return list.Select(MapToResponse).ToList();
    }

    public async Task<SettlementResponse?> GetByIdAsync(Guid id)
    {
        await SyncFromProcurementLotsAsync();

        var settlement = await _context.Settlements.FirstOrDefaultAsync(s => s.Id == id);
        if (settlement == null)
        {
            // Try lookup by lot id or settlement code
            var idStr = id.ToString();
            settlement = await _context.Settlements.FirstOrDefaultAsync(s => s.LotId == id || s.SettlementCode == idStr);
        }

        return settlement != null ? MapToResponse(settlement) : null;
    }

    public async Task<SettlementStatsResponse> GetStatsAsync()
    {
        await SyncFromProcurementLotsAsync();

        var all = await _context.Settlements.ToListAsync();

        var pending = all.Where(s => s.Status == "Pending Settlement" || s.Status == "Pending" || s.Status == "Awaiting Delivery").ToList();
        var paid = all.Where(s => s.Status == "Paid" || s.Status == "Completed").ToList();

        return new SettlementStatsResponse
        {
            TotalSettlementValue = all.Sum(s => s.FinalAmount),
            PendingSettlementValue = pending.Sum(s => s.FinalAmount),
            PaidSettlementValue = paid.Sum(s => s.FinalAmount),
            FpoMargin = all.Sum(s => s.FpoMargin),
            TotalCount = all.Count,
            PendingCount = pending.Count,
            PaidCount = paid.Count
        };
    }

    public async Task<CreatePaymentLinkResponse> CreatePaymentLinkAsync(Guid settlementId)
    {
        var settlement = await _context.Settlements.FirstOrDefaultAsync(s => s.Id == settlementId)
            ?? throw new KeyNotFoundException($"Settlement with ID {settlementId} not found");

        var result = await _razorpayMockGateway.CreatePaymentLinkAsync(
            amountInRupees: settlement.FinalAmount,
            description: $"Settlement payout for {settlement.FarmerName} - Lot #{settlement.LotNumber}",
            referenceId: settlement.SettlementCode,
            customerName: settlement.FarmerName,
            customerPhone: settlement.FarmerPhone);

        settlement.RazorpayPaymentLinkId = result.Id;
        settlement.RazorpayShortUrl = result.ShortUrl;
        settlement.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new CreatePaymentLinkResponse
        {
            PaymentLinkId = result.Id,
            ShortUrl = result.ShortUrl,
            Status = result.Status,
            Amount = settlement.FinalAmount
        };
    }

    public async Task<SettlementResponse> ProcessPaymentAsync(Guid settlementId, ProcessPaymentRequest request)
    {
        var settlement = await _context.Settlements.FirstOrDefaultAsync(s => s.Id == settlementId)
            ?? throw new KeyNotFoundException($"Settlement with ID {settlementId} not found");

        // If payment link doesn't exist, create it with MockGateway
        if (string.IsNullOrEmpty(settlement.RazorpayPaymentLinkId) || string.IsNullOrEmpty(settlement.RazorpayShortUrl))
        {
            var linkResult = await _razorpayMockGateway.CreatePaymentLinkAsync(
                amountInRupees: settlement.FinalAmount,
                description: $"Settlement payout for {settlement.FarmerName} - Lot #{settlement.LotNumber}",
                referenceId: settlement.SettlementCode,
                customerName: settlement.FarmerName,
                customerPhone: settlement.FarmerPhone);

            settlement.RazorpayPaymentLinkId = linkResult.Id;
            settlement.RazorpayShortUrl = linkResult.ShortUrl;
        }

        // Simulate/Execute capture via MockGateway action endpoint
        string paymentInternalId = string.Empty;
        if (!string.IsNullOrEmpty(settlement.RazorpayShortUrl) && settlement.RazorpayShortUrl.Contains("/pg/pay/"))
        {
            paymentInternalId = settlement.RazorpayShortUrl.Substring(settlement.RazorpayShortUrl.LastIndexOf("/pg/pay/") + 8).Trim('/');
        }

        if (string.IsNullOrEmpty(paymentInternalId))
        {
            paymentInternalId = settlement.RazorpayPaymentLinkId ?? string.Empty;
        }

        try
        {
            if (!string.IsNullOrEmpty(paymentInternalId) && request.SimulateSuccess)
            {
                await _razorpayMockGateway.CompletePaymentAsync(paymentInternalId, "captured");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CompletePayment call to MockGateway action returned an issue, continuing with DB update");
        }

        string methodDesc = "Razorpay";
        if (!string.IsNullOrEmpty(request.CardNumber))
        {
            var digits = new string(request.CardNumber.Where(char.IsDigit).ToArray());
            var last4 = digits.Length >= 4 ? digits.Substring(digits.Length - 4) : "4242";
            methodDesc = $"Razorpay Card (•••• {last4})";
        }
        else if (!string.IsNullOrEmpty(request.UpiId))
        {
            methodDesc = $"Razorpay UPI ({request.UpiId})";
        }
        else if (!string.IsNullOrEmpty(request.PaymentMethod))
        {
            methodDesc = request.PaymentMethod;
        }

        settlement.Status = "Paid";
        settlement.PaymentMethod = methodDesc;
        settlement.PaymentDate = DateTime.UtcNow;
        settlement.TransactionId = settlement.RazorpayPaymentLinkId ?? $"RZP-{Guid.NewGuid():N}".Substring(0, 18);
        settlement.UpdatedAt = DateTime.UtcNow;

        // Update lot if exists
        if (settlement.LotId.HasValue)
        {
            var lot = await _context.ProcurementLots.FirstOrDefaultAsync(l => l.Id == settlement.LotId.Value);
            if (lot != null)
            {
                lot.Status = "SETTLED";
            }
        }

        await _context.SaveChangesAsync();

        // Create notification for farmer
        if (settlement.FarmerId.HasValue)
        {
            try
            {
                await _notificationService.CreateNotificationAsync(new Notifications.DTOs.CreateNotificationRequest(
                    FarmerId: settlement.FarmerId.Value,
                    Title: "DBT Payment Disbursed",
                    Message: $"Payment of ₹{settlement.FinalAmount:N0} has been processed via Razorpay for Lot #{settlement.LotNumber}.",
                    Category: "Payment",
                    RelatedEntityId: settlement.Id.ToString(),
                    RelatedEntityType: "Settlement"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send notification for settlement payment");
            }
        }

        return MapToResponse(settlement);
    }

    public async Task<SettlementResponse> UpdateStatusAsync(Guid settlementId, string status)
    {
        var settlement = await _context.Settlements.FirstOrDefaultAsync(s => s.Id == settlementId)
            ?? throw new KeyNotFoundException($"Settlement with ID {settlementId} not found");

        settlement.Status = status;
        settlement.UpdatedAt = DateTime.UtcNow;
        if (status.Equals("Paid", StringComparison.OrdinalIgnoreCase))
        {
            settlement.PaymentDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return MapToResponse(settlement);
    }

    private static SettlementResponse MapToResponse(Settlement s)
    {
        return new SettlementResponse
        {
            Id = s.Id,
            SettlementCode = s.SettlementCode,
            OrderId = s.OrderId,
            BuyerName = s.BuyerName,
            BuyerType = s.BuyerType,
            FarmerName = s.FarmerName,
            FarmerId = s.FarmerId?.ToString() ?? "-",
            FarmerPhone = s.FarmerPhone,
            LotId = s.LotNumber ?? s.LotId?.ToString() ?? "-",
            Millet = s.MilletType,
            Quantity = s.QuantityKg,
            Unit = "kg",
            PricePerKg = s.PricePerKg,
            GrossAmount = s.GrossAmount,
            ProcurementAmount = s.GrossAmount,
            FpoMargin = s.FpoMargin,
            TransportCost = s.TransportCost,
            OtherCharges = s.OtherCharges,
            FinalAmount = s.FinalAmount,
            Status = s.Status,
            PaymentMethod = s.PaymentMethod ?? "Razorpay",
            TransactionId = s.TransactionId,
            PaymentDate = s.PaymentDate?.ToString("yyyy-MM-dd HH:mm"),
            DeliveryDate = s.DeliveryDate?.ToString("yyyy-MM-dd"),
            RazorpayPaymentLinkId = s.RazorpayPaymentLinkId,
            RazorpayShortUrl = s.RazorpayShortUrl,
            CreatedAt = s.CreatedAt
        };
    }
}
