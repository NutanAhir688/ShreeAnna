using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Features.Auth;
using backend.Features.Procurement.DTOs;
using backend.Features.Procurement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Procurement.Controllers;

[ApiController]
[Route("api/purchase-requests")]
public class PurchaseRequestsController : ControllerBase
{
    private readonly IPurchaseRequestService _service;

    public PurchaseRequestsController(IPurchaseRequestService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<PurchaseRequestResponseDto>>> GetAll([FromQuery] string? status, [FromQuery] string? processorId)
    {
        var list = await _service.GetAllAsync(status, processorId);
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PurchaseRequestResponseDto>> GetById(string id)
    {
        if (Guid.TryParse(id, out var guid))
        {
            var res = await _service.GetByIdAsync(guid);
            if (res != null) return Ok(res);
        }

        var byCode = await _service.GetByCodeOrAgreementIdAsync(id);
        if (byCode != null) return Ok(byCode);

        return NotFound(new { message = $"Purchase request '{id}' not found." });
    }

    [HttpPost]
    public async Task<ActionResult<PurchaseRequestResponseDto>> Create([FromBody] CreatePurchaseRequestDto dto)
    {
        var processorName = User.FindFirstValue(ClaimTypes.Name) ?? "Millet Shakti SHG";
        var processorId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "proc-001";

        var created = await _service.CreateAsync(dto, processorId, processorName);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPost("{id:guid}/propose-agreement")]
    public async Task<ActionResult<PurchaseRequestResponseDto>> ProposeAgreement(Guid id, [FromBody] ProposeAgreementDto dto)
    {
        var updated = await _service.ProposeAgreementAsync(id, dto);
        if (updated == null) return NotFound(new { message = "Purchase request not found." });
        return Ok(updated);
    }

    [HttpPost("{id:guid}/accept-agreement")]
    public async Task<ActionResult<PurchaseRequestResponseDto>> AcceptAgreement(Guid id)
    {
        var updated = await _service.AcceptAgreementAsync(id);
        if (updated == null) return NotFound(new { message = "Purchase request not found." });
        return Ok(updated);
    }

    [HttpPost("{id:guid}/pay")]
    public async Task<ActionResult<PurchaseRequestResponseDto>> ProcessPayment(Guid id, [FromBody] ProcessPaymentDto dto)
    {
        var updated = await _service.ProcessPaymentAsync(id, dto);
        if (updated == null) return NotFound(new { message = "Purchase request not found." });
        return Ok(updated);
    }

    [HttpPost("{id:guid}/confirm-delivery")]
    public async Task<ActionResult<PurchaseRequestResponseDto>> ConfirmDelivery(Guid id, [FromBody] ConfirmProcessorDeliveryDto dto)
    {
        try
        {
            var updated = await _service.ConfirmDeliveryAsync(id, dto);
            if (updated == null) return NotFound(new { message = "Purchase request not found." });
            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
