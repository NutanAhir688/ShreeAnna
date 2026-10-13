using backend.Features.Settlements.DTOs;
using backend.Features.Settlements.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Settlements.Controllers;

[ApiController]
[Route("api/settlements")]
[AllowAnonymous]
public class SettlementsController : ControllerBase
{
    private readonly ISettlementService _settlementService;

    public SettlementsController(ISettlementService settlementService)
    {
        _settlementService = settlementService;
    }

    [HttpGet]
    public async Task<ActionResult<List<SettlementResponse>>> GetAll([FromQuery] string? status)
    {
        var result = await _settlementService.GetAllAsync(status);
        return Ok(result);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<SettlementStatsResponse>> GetStats()
    {
        var result = await _settlementService.GetStatsAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SettlementResponse>> GetById(Guid id)
    {
        var result = await _settlementService.GetByIdAsync(id);
        if (result == null) return NotFound(new { message = "Settlement not found" });
        return Ok(result);
    }

    [HttpPost("{id:guid}/create-payment-link")]
    public async Task<ActionResult<CreatePaymentLinkResponse>> CreatePaymentLink(Guid id)
    {
        try
        {
            var result = await _settlementService.CreatePaymentLinkAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Settlement not found" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/pay")]
    public async Task<ActionResult<SettlementResponse>> ProcessPayment(Guid id, [FromBody] ProcessPaymentRequest? request)
    {
        try
        {
            var result = await _settlementService.ProcessPaymentAsync(id, request ?? new ProcessPaymentRequest());
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Settlement not found" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<SettlementResponse>> UpdateStatus(Guid id, [FromBody] UpdateSettlementStatusRequest request)
    {
        try
        {
            var result = await _settlementService.UpdateStatusAsync(id, request.Status);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Settlement not found" });
        }
    }
}
