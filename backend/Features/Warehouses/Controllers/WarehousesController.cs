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
}
