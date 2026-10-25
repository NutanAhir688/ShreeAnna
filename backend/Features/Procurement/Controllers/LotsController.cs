using System.Security.Claims;
using backend.Features.Auth;
using backend.Features.Procurement.DTOs;
using backend.Features.Procurement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Procurement.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class LotsController : ControllerBase
{
    private readonly ILotService _lotService;

    public LotsController(ILotService lotService)
    {
        _lotService = lotService;
    }

    [HttpGet("lots")]
    [AllowAnonymous]
    public async Task<ActionResult<List<LotResponse>>> GetAll()
    {
        var lots = await _lotService.GetAllAsync();
        return Ok(lots);
    }

    [HttpGet("farmers/me/lots")]
    [Authorize(Roles = Roles.Farmer)]
    public async Task<ActionResult<List<LotResponse>>> GetMyLots()
    {
        var farmerId = GetLoggedInFarmerId();
        var lots = await _lotService.GetByFarmerIdAsync(farmerId);
        return Ok(lots);
    }

    [HttpGet("farmers/{farmerId:guid}/lots")]
    public async Task<ActionResult<List<LotResponse>>> GetFarmerLots(Guid farmerId)
    {
        if (User.IsInRole(Roles.Farmer))
        {
            var loggedInFarmerId = GetLoggedInFarmerId();
            if (loggedInFarmerId != farmerId)
            {
                return Forbid();
            }
        }

        var lots = await _lotService.GetByFarmerIdAsync(farmerId);
        return Ok(lots);
    }

    [HttpPost("farmers/me/lots")]
    [Authorize(Roles = Roles.Farmer)]
    public async Task<ActionResult<LotResponse>> CreateMyLot(CreateLotRequest request)
    {
        var farmerId = GetLoggedInFarmerId();
        try
        {
            var lot = await _lotService.CreateAsync(farmerId, request);
            return CreatedAtAction(nameof(GetById), new { id = lot.Id }, lot);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("farmers/{farmerId:guid}/lots")]
    [Authorize(Roles = Roles.Farmer)]
    public async Task<ActionResult<LotResponse>> CreateFarmerLot(Guid farmerId, CreateLotRequest request)
    {
        var loggedInFarmerId = GetLoggedInFarmerId();
        if (loggedInFarmerId != farmerId)
        {
            return Forbid();
        }

        try
        {
            var lot = await _lotService.CreateAsync(farmerId, request);
            return CreatedAtAction(nameof(GetById), new { id = lot.Id }, lot);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet("lots/{id:guid}")]
    public async Task<ActionResult<LotResponse>> GetById(Guid id)
    {
        var lot = await _lotService.GetByIdAsync(id);
        if (lot is null)
        {
            return NotFound(new { message = "Lot not found." });
        }

        if (User.IsInRole(Roles.Farmer))
        {
            var loggedInFarmerId = GetLoggedInFarmerId();
            if (loggedInFarmerId != lot.FarmerId)
            {
                return Forbid();
            }
        }

        return Ok(lot);
    }

    [HttpGet("lots/{id:guid}/timeline")]
    public async Task<ActionResult<LotTimelineResponse>> GetTimeline(Guid id)
    {
        var timeline = await _lotService.GetTimelineAsync(id);
        if (timeline is null)
        {
            return NotFound(new { message = "Lot not found." });
        }

        return Ok(timeline);
    }

    [HttpPost("lots/{id:guid}/agreement/create")]
    public async Task<IActionResult> CreateAgreement(Guid id, [FromBody] FormulateAgreementRequest? request)
    {
        var result = await _lotService.CreateAgreementAsync(id, request);
        if (!result)
        {
            return NotFound(new { message = "Lot not found." });
        }

        return Ok(new { message = "Agreement created and sent to farmer for consent." });
    }

    [HttpPost("lots/{id:guid}/agreement/accept")]
    public async Task<IActionResult> AcceptAgreement(Guid id, [FromQuery] string? role = null)
    {
        bool isFarmer = User.IsInRole(Roles.Farmer) || string.Equals(role, "Farmer", StringComparison.OrdinalIgnoreCase);
        var result = await _lotService.AcceptAgreementAsync(id, isFarmer);
        if (!result)
        {
            return NotFound(new { message = "Lot not found." });
        }

        return Ok(new { message = "Agreement accepted successfully." });
    }

    [HttpPost("lots/{id:guid}/agreement/reject")]
    public async Task<IActionResult> RejectAgreement(Guid id, RejectAgreementRequest request, [FromQuery] string? role = null)
    {
        bool isFarmer = User.IsInRole(Roles.Farmer) || string.Equals(role, "Farmer", StringComparison.OrdinalIgnoreCase);
        var result = await _lotService.RejectAgreementAsync(id, request, isFarmer);
        if (!result)
        {
            return NotFound(new { message = "Lot not found." });
        }

        return Ok(new { message = "Agreement rejected successfully." });
    }

    [HttpPost("lots/{id:guid}/pickup/reschedule")]
    public async Task<IActionResult> ReschedulePickup(Guid id, ReschedulePickupRequest request)
    {
        var result = await _lotService.ReschedulePickupAsync(id, request);
        if (!result)
        {
            return NotFound(new { message = "Lot not found." });
        }

        return Ok(new { message = "Pickup reschedule requested successfully." });
    }

    [HttpPost("lots/{id:guid}/assign-inspector")]
    public async Task<ActionResult<LotResponse>> AssignInspector(Guid id, AssignInspectorRequest request)
    {
        var lot = await _lotService.AssignInspectorAsync(id, request);
        if (lot is null)
        {
            return NotFound(new { message = "Lot not found." });
        }

        return Ok(lot);
    }

    [HttpPost("lots/{id:guid}/inspector-location")]
    public async Task<ActionResult<LotResponse>> UpdateInspectorLocation(Guid id, UpdateInspectorLocationRequest request)
    {
        var lot = await _lotService.UpdateInspectorLocationAsync(id, request);
        if (lot is null)
        {
            return NotFound(new { message = "Lot not found." });
        }

        return Ok(lot);
    }

    [HttpGet("inspectors")]
    [HttpGet("lots/inspectors")]
    public async Task<ActionResult<List<InspectorResponse>>> GetInspectors()
    {
        var inspectors = await _lotService.GetInspectorsAsync();
        return Ok(inspectors);
    }

    [HttpPost("lots/{lotId}/location")]
    public async Task<IActionResult> RecordDriverLocation(string lotId, [FromBody] RecordDriverLocationRequest request)
    {
        try
        {
            var success = await _lotService.RecordDriverLocationAsync(lotId, request, User);
            if (!success)
            {
                return NotFound(new { message = "Lot not found." });
            }
            return Ok(new { message = "Driver location recorded successfully." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("lots/{lotId}/location")]
    public async Task<ActionResult<DriverLocationResponse>> GetDriverLocation(string lotId)
    {
        try
        {
            var location = await _lotService.GetDriverLocationAsync(lotId, User);
            if (location is null)
            {
                return NotFound(new { message = "No driver location has been recorded for this lot yet." });
            }
            return Ok(location);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }


    private Guid GetLoggedInFarmerId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(claim, out var farmerId))
        {
            throw new UnauthorizedAccessException();
        }

        return farmerId;
    }
}
