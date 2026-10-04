using backend.Features.Logistics.DTOs;
using backend.Features.Logistics.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Logistics.Controllers;

[ApiController]
[Route("api/dispatches")]
[Authorize]
public class LogisticsController : ControllerBase
{
    private readonly ILogisticsService _logisticsService;

    public LogisticsController(ILogisticsService logisticsService)
    {
        _logisticsService = logisticsService;
    }

    [HttpGet]
    public async Task<ActionResult<List<DispatchResponse>>> GetAll()
    {
        var dispatches = await _logisticsService.GetAllAsync();
        return Ok(dispatches);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DispatchResponse>> GetById(Guid id)
    {
        var dispatch = await _logisticsService.GetByIdAsync(id);
        if (dispatch is null) return NotFound(new { message = "Dispatch not found" });
        return Ok(dispatch);
    }

    [HttpPost]
    public async Task<ActionResult<DispatchResponse>> Create([FromBody] CreateDispatchRequest request)
    {
        try
        {
            var dispatch = await _logisticsService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = dispatch.Id }, dispatch);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<DispatchResponse>> UpdateStatus(Guid id, [FromBody] UpdateDispatchStatusRequest request)
    {
        try
        {
            var dispatch = await _logisticsService.UpdateStatusAsync(id, request.Status);
            return Ok(dispatch);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/confirm-delivery")]
    public async Task<ActionResult<DispatchResponse>> ConfirmDelivery(Guid id, [FromBody] ConfirmDeliveryRequest request)
    {
        try
        {
            var dispatch = await _logisticsService.ConfirmDeliveryAsync(id, request);
            return Ok(dispatch);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("report-issue")]
    [HttpPost("{id:guid}/report-issue")]
    public async Task<ActionResult<ShipmentIssueResponse>> ReportIssue([FromRoute] Guid? id, [FromBody] ReportIssueRequest request)
    {
        try
        {
            var issue = await _logisticsService.ReportIssueAsync(id, request);
            return Ok(issue);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public record UpdateDispatchStatusRequest(string Status);
