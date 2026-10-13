using backend.Features.Reports.DTOs;
using backend.Features.Reports.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Reports.Controllers;

[ApiController]
[Route("api/reports")]
[AllowAnonymous]
public class ReportsController : ControllerBase
{
    private readonly IReportsService _reportsService;

    public ReportsController(IReportsService reportsService)
    {
        _reportsService = reportsService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ReportsSummaryResponse>> GetSummary()
    {
        var result = await _reportsService.GetSummaryAsync();
        return Ok(result);
    }

    [HttpGet("finance")]
    public async Task<ActionResult<FinanceReportResponse>> GetFinanceReport([FromQuery] int? year)
    {
        var result = await _reportsService.GetFinanceReportAsync(year);
        return Ok(result);
    }

    [HttpGet("revenue")]
    public async Task<ActionResult<RevenueReportResponse>> GetRevenueReport()
    {
        var result = await _reportsService.GetRevenueReportAsync();
        return Ok(result);
    }

    [HttpGet("margin")]
    public async Task<ActionResult<FpoMarginReportResponse>> GetFpoMarginReport()
    {
        var result = await _reportsService.GetFpoMarginReportAsync();
        return Ok(result);
    }
}
