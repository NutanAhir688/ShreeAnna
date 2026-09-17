using backend.Features.Inventory.DTOs;
using backend.Features.Inventory.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Inventory.Controllers;

[ApiController]
[Route("api/inventory")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<ActionResult<List<InventoryBatchResponse>>> GetAllBatches()
    {
        var batches = await _inventoryService.GetAllBatchesAsync();
        return Ok(batches);
    }

    [HttpGet("movements")]
    public async Task<ActionResult<List<StockMovementResponse>>> GetAllMovements()
    {
        var movements = await _inventoryService.GetAllMovementsAsync();
        return Ok(movements);
    }

    [HttpPost("movements")]
    public async Task<ActionResult<StockMovementResponse>> CreateMovement(CreateStockMovementRequest request)
    {
        try
        {
            var result = await _inventoryService.CreateMovementAsync(request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
