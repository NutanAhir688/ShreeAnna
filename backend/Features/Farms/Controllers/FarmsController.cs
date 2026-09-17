using System.Security.Claims;
using backend.Features.Auth;
using backend.Features.Farms.DTOs;
using backend.Features.Farms.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Farms.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class FarmsController : ControllerBase
{
    private readonly IFarmService _farmService;

    public FarmsController(IFarmService farmService)
    {
        _farmService = farmService;
    }

    [HttpGet("farms")]
    public async Task<ActionResult<List<FarmResponse>>> GetAllFarms()
    {
        var farms = await _farmService.GetAllAsync();
        return Ok(farms);
    }

    [HttpGet("farmers/{farmerId}/farms")]
    public async Task<ActionResult<List<FarmResponse>>> GetFarmerFarms(
        Guid farmerId)
    {
        if (User.IsInRole(Roles.Farmer))
        {
            var loggedInFarmerId = GetLoggedInFarmerId();

            if (loggedInFarmerId != farmerId)
            {
                return Forbid();
            }
        }

        var farms = await _farmService.GetByFarmerIdAsync(farmerId);

        return Ok(farms);
    }

    [HttpGet("farms/{id}")]
    public async Task<ActionResult<FarmResponse>> GetById(Guid id)
    {
        var farm = await _farmService.GetByIdAsync(id);

        if (farm is null)
        {
            return NotFound(new
            {
                message = "Farm not found."
            });
        }

        if (User.IsInRole(Roles.Farmer))
        {
            var loggedInFarmerId = GetLoggedInFarmerId();

            if (loggedInFarmerId != farm.FarmerId)
            {
                return Forbid();
            }
        }

        return Ok(farm);
    }

    [HttpPost("farmers/{farmerId}/farms")]
    [Authorize(Roles = Roles.Farmer)]
    public async Task<ActionResult<FarmResponse>> Create(
        Guid farmerId,
        CreateFarmRequest request)
    {
        var loggedInFarmerId = GetLoggedInFarmerId();

        if (loggedInFarmerId != farmerId)
        {
            return Forbid();
        }

        try
        {
            var farm = await _farmService.CreateAsync(
                farmerId,
                request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = farm.Id },
                farm);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPut("farms/{id}")]
    [Authorize(Roles = Roles.Farmer)]
    public async Task<ActionResult<FarmResponse>> Update(
        Guid id,
        UpdateFarmRequest request)
    {
        var farm = await _farmService.GetByIdAsync(id);

        if (farm is null)
        {
            return NotFound(new
            {
                message = "Farm not found."
            });
        }

        var loggedInFarmerId = GetLoggedInFarmerId();

        if (loggedInFarmerId != farm.FarmerId)
        {
            return Forbid();
        }

        var updatedFarm = await _farmService.UpdateAsync(
            id,
            request);

        return Ok(updatedFarm);
    }

    [HttpDelete("farms/{id}")]
    [Authorize(Roles = Roles.Farmer)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var farm = await _farmService.GetByIdAsync(id);

        if (farm is null)
        {
            return NotFound(new
            {
                message = "Farm not found."
            });
        }

        var loggedInFarmerId = GetLoggedInFarmerId();

        if (loggedInFarmerId != farm.FarmerId)
        {
            return Forbid();
        }

        var deleted = await _farmService.DeleteAsync(id);

        return deleted
            ? NoContent()
            : NotFound();
    }

    [HttpPatch("farms/{id}/archive")]
    [Authorize(Roles = Roles.Farmer)]
    public async Task<IActionResult> Archive(Guid id)
    {
        var farm = await _farmService.GetByIdAsync(id);

        if (farm is null)
        {
            return NotFound(new
            {
                message = "Farm not found."
            });
        }

        var loggedInFarmerId = GetLoggedInFarmerId();

        if (loggedInFarmerId != farm.FarmerId)
        {
            return Forbid();
        }

        var archived = await _farmService.ArchiveAsync(id);

        return archived
            ? Ok(new { message = "Farm archived successfully." })
            : NotFound();
    }

    [HttpPatch("farms/{id}/status")]
    public async Task<ActionResult<FarmResponse>> UpdateStatus(
        Guid id,
        [FromBody] UpdateFarmStatusRequest request)
    {
        var updated = await _farmService.UpdateStatusAsync(id, request.Status, User.Identity?.Name);

        if (updated is null)
        {
            return NotFound(new { message = "Farm not found." });
        }

        return Ok(updated);
    }

    private Guid GetLoggedInFarmerId()
    {
        var claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(claim, out var farmerId))
        {
            throw new UnauthorizedAccessException();
        }

        return farmerId;
    }
}