using backend.Features.Farmers.DTOs;
using backend.Features.Farmers.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend.Features.Auth;

namespace backend.Features.Farmers.Controllers;

[ApiController]
[Route("api/farmers")]
[Authorize]
public class FarmersController : ControllerBase
{
    private readonly IFarmerService _farmerService;

    public FarmersController(IFarmerService farmerService)
    {
        _farmerService = farmerService;
    }
    [HttpGet("me")]
    [Authorize(Roles = Roles.Farmer)]
    public async Task<ActionResult<FarmerResponse>> GetMe()
    {
        var farmerIdClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(farmerIdClaim, out var farmerId))
        {
            return Unauthorized();
        }

        var farmer = await _farmerService.GetByIdAsync(farmerId);

        if (farmer is null)
        {
            return NotFound(new
            {
                message = "Farmer profile not found."
            });
        }

        return Ok(farmer);
    }

    [HttpPost]
    [Authorize(Roles = Roles.FpoManager)]
    public async Task<ActionResult<FarmerResponse>> Create(
        CreateFarmerRequest request)
    {
        var farmer = await _farmerService.CreateAsync(request);

        return CreatedAtAction(
            nameof(GetById),
            new { id = farmer.Id },
            farmer);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<FarmerResponse>> Register(
        CreateFarmerRequest request)
    {
        var farmer = await _farmerService.CreateAsync(request);

        return CreatedAtAction(
            nameof(GetById),
            new { id = farmer.Id },
            farmer);
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<FarmerResponse>>> GetAll()
    {
        var farmers = await _farmerService.GetAllAsync();

        return Ok(farmers);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FarmerResponse>> GetById(Guid id)
    {
        var farmer = await _farmerService.GetByIdAsync(id);

        if (farmer is null)
        {
            return NotFound(new
            {
                message = "Farmer not found."
            });
        }

        return Ok(farmer);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.FpoManager)]
    public async Task<ActionResult<FarmerResponse>> Update(
        Guid id,
        UpdateFarmerRequest request)
    {
        var farmer = await _farmerService.UpdateAsync(id, request);

        if (farmer is null)
        {
            return NotFound(new
            {
                message = "Farmer not found."
            });
        }

        return Ok(farmer);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = Roles.FpoManager)]
    public async Task<IActionResult> ChangeStatus(
        Guid id,
        [FromQuery] string status)
    {
        var updated = await _farmerService.ChangeStatusAsync(
            id,
            status);

        if (!updated)
        {
            return NotFound(new
            {
                message = "Farmer not found."
            });
        }

        return Ok(new
        {
            message = "Farmer status updated successfully."
        });
    }
}