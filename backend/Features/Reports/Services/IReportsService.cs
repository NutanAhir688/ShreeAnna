using backend.Features.Reports.DTOs;

namespace backend.Features.Reports.Services;

public interface IReportsService
{
    Task<ReportsSummaryResponse> GetSummaryAsync();
    Task<FinanceReportResponse> GetFinanceReportAsync(int? year);
    Task<RevenueReportResponse> GetRevenueReportAsync();
    Task<FpoMarginReportResponse> GetFpoMarginReportAsync();
}
