using backend.Data;
using backend.Features.Reports.DTOs;
using backend.Features.Settlements.Services;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.Services;

public class ReportsService : IReportsService
{
    private readonly AppDbContext _context;
    private readonly ISettlementService _settlementService;

    public ReportsService(AppDbContext context, ISettlementService settlementService)
    {
        _context = context;
        _settlementService = settlementService;
    }

    public async Task<ReportsSummaryResponse> GetSummaryAsync()
    {
        // Ensure lots are synced to settlements
        await _settlementService.GetAllAsync();

        var settlements = await _context.Settlements.ToListAsync();
        var lots = await _context.ProcurementLots.ToListAsync();
        var activeFarmers = await _context.Farmers.CountAsync(f => f.Status == "Active");

        var totalProcurementKg = settlements.Sum(s => s.QuantityKg);
        var totalProcurementAmount = settlements.Sum(s => s.GrossAmount);
        var paidSettlements = settlements.Where(s => s.Status == "Paid" || s.Status == "Completed").ToList();
        var pendingSettlements = settlements.Where(s => s.Status == "Pending Settlement" || s.Status == "Pending" || s.Status == "Awaiting Delivery").ToList();

        var varietyGroup = settlements
            .GroupBy(s => string.IsNullOrWhiteSpace(s.MilletType) ? "Millet" : s.MilletType)
            .Select(g => new MilletReportItem
            {
                Millet = g.Key,
                QuantityKg = g.Sum(x => x.QuantityKg),
                TotalAmount = g.Sum(x => x.GrossAmount),
                FpoMargin = g.Sum(x => x.FpoMargin),
                LotsCount = g.Count()
            })
            .OrderByDescending(x => x.TotalAmount)
            .ToList();

        var recentSettlements = settlements
            .OrderByDescending(s => s.CreatedAt)
            .Take(10)
            .Select(s => new SettlementReportItem
            {
                Id = s.Id,
                SettlementCode = s.SettlementCode,
                OrderId = s.OrderId,
                FarmerName = s.FarmerName,
                Millet = s.MilletType,
                QuantityKg = s.QuantityKg,
                GrossAmount = s.GrossAmount,
                FpoMargin = s.FpoMargin,
                FinalAmount = s.FinalAmount,
                Status = s.Status,
                PaymentMethod = s.PaymentMethod ?? "Razorpay",
                TransactionId = s.TransactionId ?? s.RazorpayPaymentLinkId,
                PaymentDate = s.PaymentDate
            })
            .ToList();

        return new ReportsSummaryResponse
        {
            TotalProcurementKg = totalProcurementKg,
            TotalProcurementAmount = totalProcurementAmount,
            TotalDisbursedAmount = paidSettlements.Sum(s => s.FinalAmount),
            TotalPendingAmount = pendingSettlements.Sum(s => s.FinalAmount),
            TotalFpoMargin = settlements.Sum(s => s.FpoMargin),
            ActiveFarmersCount = activeFarmers,
            TotalLotsCount = lots.Count,
            ProcurementByMillet = varietyGroup,
            RecentSettlements = recentSettlements
        };
    }

    public async Task<FinanceReportResponse> GetFinanceReportAsync(int? year)
    {
        await _settlementService.GetAllAsync();

        var settlements = await _context.Settlements.ToListAsync();
        if (year.HasValue && year.Value > 0)
        {
            settlements = settlements.Where(s => s.CreatedAt.Year == year.Value).ToList();
        }

        var paidSettlements = settlements.Where(s => s.Status == "Paid" || s.Status == "Completed").ToList();
        var pendingSettlements = settlements.Where(s => s.Status == "Pending Settlement" || s.Status == "Pending" || s.Status == "Awaiting Delivery").ToList();

        var totalGross = settlements.Sum(s => s.GrossAmount);
        var totalDisbursed = paidSettlements.Sum(s => s.FinalAmount);
        var totalPending = pendingSettlements.Sum(s => s.FinalAmount);
        var totalTransport = settlements.Sum(s => s.TransportCost);
        var totalOther = settlements.Sum(s => s.OtherCharges);
        var totalMargin = settlements.Sum(s => s.FpoMargin);

        decimal rate = settlements.Count > 0
            ? Math.Round((decimal)paidSettlements.Count / settlements.Count * 100m, 1)
            : 100m;

        // Group by month
        var monthly = settlements
            .GroupBy(s => s.CreatedAt.ToString("MMM yyyy"))
            .Select(g => new MonthlyFinancialMetric
            {
                Month = g.Key,
                GrossValue = g.Sum(x => x.GrossAmount),
                DisbursedAmount = g.Where(x => x.Status == "Paid" || x.Status == "Completed").Sum(x => x.FinalAmount),
                FpoMargin = g.Sum(x => x.FpoMargin),
                SettlementsCount = g.Count()
            })
            .ToList();

        var transactions = settlements
            .OrderByDescending(s => s.PaymentDate ?? s.CreatedAt)
            .Select(s => new SettlementReportItem
            {
                Id = s.Id,
                SettlementCode = s.SettlementCode,
                OrderId = s.OrderId,
                FarmerName = s.FarmerName,
                Millet = s.MilletType,
                QuantityKg = s.QuantityKg,
                GrossAmount = s.GrossAmount,
                FpoMargin = s.FpoMargin,
                FinalAmount = s.FinalAmount,
                Status = s.Status,
                PaymentMethod = s.PaymentMethod ?? "Razorpay DBT",
                TransactionId = s.TransactionId ?? s.RazorpayPaymentLinkId,
                PaymentDate = s.PaymentDate ?? s.CreatedAt
            })
            .ToList();

        return new FinanceReportResponse
        {
            TotalGrossValue = totalGross,
            TotalDisbursed = totalDisbursed,
            TotalPendingLiability = totalPending,
            TotalTransportDeductions = totalTransport,
            TotalOtherDeductions = totalOther,
            TotalFpoMargin = totalMargin,
            DisbursementCompletionRate = rate,
            TotalSettlementsCount = settlements.Count,
            PaidCount = paidSettlements.Count,
            PendingCount = pendingSettlements.Count,
            MonthlyBreakdown = monthly,
            Transactions = transactions
        };
    }

    public async Task<RevenueReportResponse> GetRevenueReportAsync()
    {
        await _settlementService.GetAllAsync();

        var settlements = await _context.Settlements.ToListAsync();
        var totalGross = settlements.Sum(s => s.GrossAmount);
        var totalVolume = settlements.Sum(s => s.QuantityKg);
        var avgRate = totalVolume > 0 ? Math.Round(totalGross / totalVolume, 2) : 0m;
        var totalDisbursed = settlements.Where(s => s.Status == "Paid" || s.Status == "Completed").Sum(s => s.FinalAmount);
        var totalMargin = settlements.Sum(s => s.FpoMargin);

        var varietyBreakdown = settlements
            .GroupBy(s => string.IsNullOrWhiteSpace(s.MilletType) ? "Millet" : s.MilletType)
            .Select(g =>
            {
                var qty = g.Sum(x => x.QuantityKg);
                var gross = g.Sum(x => x.GrossAmount);
                var avg = qty > 0 ? Math.Round(gross / qty, 2) : 0m;
                var pct = totalVolume > 0 ? Math.Round((qty / totalVolume) * 100m, 1) : 0m;

                return new MilletRevenueItem
                {
                    Millet = g.Key,
                    QuantityKg = qty,
                    AverageRatePerKg = avg,
                    GrossValue = gross,
                    FpoMargin = g.Sum(x => x.FpoMargin),
                    NetPayout = g.Sum(x => x.FinalAmount),
                    LotsCount = g.Count(),
                    VolumePercentage = pct
                };
            })
            .OrderByDescending(x => x.GrossValue)
            .ToList();

        return new RevenueReportResponse
        {
            TotalGrossValuation = totalGross,
            AverageRatePerKg = avgRate,
            TotalVolumeKg = totalVolume,
            TotalDisbursed = totalDisbursed,
            TotalFpoMargin = totalMargin,
            VarietyBreakdown = varietyBreakdown
        };
    }

    public async Task<FpoMarginReportResponse> GetFpoMarginReportAsync()
    {
        await _settlementService.GetAllAsync();

        var settlements = await _context.Settlements.ToListAsync();
        var totalMargin = settlements.Sum(s => s.FpoMargin);
        var totalGross = settlements.Sum(s => s.GrossAmount);
        var totalTransport = settlements.Sum(s => s.TransportCost);
        var netSurplus = totalMargin;

        var marginByVariety = settlements
            .GroupBy(s => string.IsNullOrWhiteSpace(s.MilletType) ? "Millet" : s.MilletType)
            .Select(g => new MilletReportItem
            {
                Millet = g.Key,
                QuantityKg = g.Sum(x => x.QuantityKg),
                TotalAmount = g.Sum(x => x.GrossAmount),
                FpoMargin = g.Sum(x => x.FpoMargin),
                LotsCount = g.Count()
            })
            .OrderByDescending(x => x.FpoMargin)
            .ToList();

        var lotBreakdown = settlements
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new LotMarginItem
            {
                SettlementCode = s.SettlementCode,
                LotNumber = s.LotNumber ?? s.LotId?.ToString() ?? "-",
                FarmerName = s.FarmerName,
                Millet = s.MilletType,
                GrossAmount = s.GrossAmount,
                MarginRatePercentage = 5m,
                FpoMarginAmount = s.FpoMargin,
                TransportCost = s.TransportCost,
                NetFarmerPayout = s.FinalAmount,
                Status = s.Status,
                Date = s.CreatedAt
            })
            .ToList();

        return new FpoMarginReportResponse
        {
            TotalFpoMargin = totalMargin,
            MarginRatePercentage = 5m,
            TotalProcurementGross = totalGross,
            TotalTransportCollected = totalTransport,
            NetFpoSurplus = netSurplus,
            MarginByVariety = marginByVariety,
            LotBreakdown = lotBreakdown
        };
    }
}
