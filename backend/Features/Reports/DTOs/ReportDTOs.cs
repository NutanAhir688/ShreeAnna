namespace backend.Features.Reports.DTOs;

public class MilletReportItem
{
    public string Millet { get; set; } = string.Empty;
    public decimal QuantityKg { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal FpoMargin { get; set; }
    public int LotsCount { get; set; }
}

public class SettlementReportItem
{
    public Guid Id { get; set; }
    public string SettlementCode { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
    public string FarmerName { get; set; } = string.Empty;
    public string Millet { get; set; } = string.Empty;
    public decimal QuantityKg { get; set; }
    public decimal GrossAmount { get; set; }
    public decimal FpoMargin { get; set; }
    public decimal FinalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public DateTime? PaymentDate { get; set; }
}

public class MonthlyFinancialMetric
{
    public string Month { get; set; } = string.Empty;
    public decimal DisbursedAmount { get; set; }
    public decimal GrossValue { get; set; }
    public decimal FpoMargin { get; set; }
    public int SettlementsCount { get; set; }
}

public class ReportsSummaryResponse
{
    public decimal TotalProcurementKg { get; set; }
    public decimal TotalProcurementAmount { get; set; }
    public decimal TotalDisbursedAmount { get; set; }
    public decimal TotalPendingAmount { get; set; }
    public decimal TotalFpoMargin { get; set; }
    public int ActiveFarmersCount { get; set; }
    public int TotalLotsCount { get; set; }
    public List<MilletReportItem> ProcurementByMillet { get; set; } = new();
    public List<SettlementReportItem> RecentSettlements { get; set; } = new();
}

public class FinanceReportResponse
{
    public decimal TotalGrossValue { get; set; }
    public decimal TotalDisbursed { get; set; }
    public decimal TotalPendingLiability { get; set; }
    public decimal TotalTransportDeductions { get; set; }
    public decimal TotalOtherDeductions { get; set; }
    public decimal TotalFpoMargin { get; set; }
    public decimal DisbursementCompletionRate { get; set; }
    public int TotalSettlementsCount { get; set; }
    public int PaidCount { get; set; }
    public int PendingCount { get; set; }
    public List<MonthlyFinancialMetric> MonthlyBreakdown { get; set; } = new();
    public List<SettlementReportItem> Transactions { get; set; } = new();
}

public class MilletRevenueItem
{
    public string Millet { get; set; } = string.Empty;
    public decimal QuantityKg { get; set; }
    public decimal AverageRatePerKg { get; set; }
    public decimal GrossValue { get; set; }
    public decimal FpoMargin { get; set; }
    public decimal NetPayout { get; set; }
    public int LotsCount { get; set; }
    public decimal VolumePercentage { get; set; }
}

public class RevenueReportResponse
{
    public decimal TotalGrossValuation { get; set; }
    public decimal AverageRatePerKg { get; set; }
    public decimal TotalVolumeKg { get; set; }
    public decimal TotalDisbursed { get; set; }
    public decimal TotalFpoMargin { get; set; }
    public List<MilletRevenueItem> VarietyBreakdown { get; set; } = new();
}

public class LotMarginItem
{
    public string SettlementCode { get; set; } = string.Empty;
    public string LotNumber { get; set; } = string.Empty;
    public string FarmerName { get; set; } = string.Empty;
    public string Millet { get; set; } = string.Empty;
    public decimal GrossAmount { get; set; }
    public decimal MarginRatePercentage { get; set; } = 5m;
    public decimal FpoMarginAmount { get; set; }
    public decimal TransportCost { get; set; }
    public decimal NetFarmerPayout { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}

public class FpoMarginReportResponse
{
    public decimal TotalFpoMargin { get; set; }
    public decimal MarginRatePercentage { get; set; } = 5m;
    public decimal TotalProcurementGross { get; set; }
    public decimal TotalTransportCollected { get; set; }
    public decimal NetFpoSurplus { get; set; }
    public List<MilletReportItem> MarginByVariety { get; set; } = new();
    public List<LotMarginItem> LotBreakdown { get; set; } = new();
}
