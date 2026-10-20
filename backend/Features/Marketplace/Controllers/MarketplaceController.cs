using System.Security.Claims;
using backend.Features.Marketplace.DTOs;
using backend.Features.Marketplace.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Marketplace.Controllers;

[ApiController]
[Route("api/marketplace")]
public class MarketplaceController : ControllerBase
{
    private readonly IMarketplaceService _marketplaceService;

    public MarketplaceController(IMarketplaceService marketplaceService)
    {
        _marketplaceService = marketplaceService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<ProductResponse>>> GetAll([FromQuery] string? status, [FromQuery] string? search)
    {
        var products = await _marketplaceService.GetAllAsync(status, search);
        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProductResponse>> GetById(Guid id)
    {
        var product = await _marketplaceService.GetByIdAsync(id);
        if (product == null) return NotFound(new { message = $"Product with id {id} not found." });
        return Ok(product);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<ProductResponse>> Create([FromBody] CreateProductRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { message = "Title is required." });

        Guid? userId = null;
        var subClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (Guid.TryParse(subClaim, out var parsed)) userId = parsed;

        var product = await _marketplaceService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProductResponse>> Update(Guid id, [FromBody] UpdateProductRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { message = "Title is required." });

        var updated = await _marketplaceService.UpdateAsync(id, request);
        if (updated == null) return NotFound(new { message = $"Product with id {id} not found." });
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/status")]
    [AllowAnonymous]
    public async Task<ActionResult<ProductResponse>> UpdateStatus(Guid id, [FromBody] UpdateProductStatusRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Status))
            return BadRequest(new { message = "Status is required." });

        var updated = await _marketplaceService.UpdateStatusAsync(id, request.Status);
        if (updated == null) return NotFound(new { message = $"Product with id {id} not found." });
        return Ok(updated);
    }

    [HttpPost("{id:guid}/unpublish")]
    [AllowAnonymous]
    public async Task<ActionResult<ProductResponse>> Unpublish(Guid id)
    {
        var updated = await _marketplaceService.UpdateStatusAsync(id, "Unpublished");
        if (updated == null) return NotFound(new { message = $"Product with id {id} not found." });
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> Delete(Guid id)
    {
        var success = await _marketplaceService.DeleteAsync(id);
        if (!success) return NotFound(new { message = $"Product with id {id} not found." });
        return Ok(new { message = "Product deleted successfully." });
    }
}
