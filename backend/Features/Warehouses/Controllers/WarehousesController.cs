using backend.Features.Warehouses.DTOs;
using backend.Features.Warehouses.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Warehouses.Controllers;

[ApiController]
[Route("api/warehouses")]
[Authorize]
public class WarehousesController : ControllerBase
{
    private readonly IWarehouseService _warehouseService;

    public WarehousesController(IWarehouseService warehouseService)
    {
        _warehouseService = warehouseService;
    }

    [HttpGet]
    public async Task<ActionResult<List<WarehouseResponse>>> GetAll()
    {
        var warehouses = await _warehouseService.GetAllAsync();
        return Ok(warehouses);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WarehouseResponse>> GetById(Guid id)
    {
        var warehouse = await _warehouseService.GetByIdAsync(id);
        if (warehouse is null) return NotFound(new { message = "Warehouse not found." });
        return Ok(warehouse);
    }

    [HttpPost]
    public async Task<ActionResult<WarehouseResponse>> Create(CreateWarehouseRequest request)
    {
        var warehouse = await _warehouseService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = warehouse.Id }, warehouse);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var success = await _warehouseService.DeleteAsync(id);
        if (!success) return NotFound(new { message = "Warehouse not found." });
        return Ok(new { message = "Warehouse deleted successfully." });
    }

    [HttpPost("receipts")]
    public async Task<ActionResult<WarehouseReceiptResponse>> CreateReceipt([FromBody] CreateWarehouseReceiptRequest request)
    {
        try
        {
            var receipt = await _warehouseService.CreateReceiptAsync(request);
            return Ok(receipt);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("receipts/lot/{identifier}")]
    [AllowAnonymous]
    public async Task<ActionResult<WarehouseReceiptResponse>> GetReceiptByLot(string identifier)
    {
        var receipt = await _warehouseService.GetReceiptByLotOrDispatchAsync(identifier);
        if (receipt is null) return NotFound(new { message = "Warehouse receipt not found." });
        return Ok(receipt);
    }

    [HttpPost("allocate-lot")]
    public async Task<ActionResult<LotAllocationResponse>> AllocateLot([FromBody] AllocateLotRequest request)
    {
        try
        {
            var allocation = await _warehouseService.AllocateLotAsync(request);
            return Ok(allocation);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

