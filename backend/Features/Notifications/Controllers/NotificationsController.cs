namespace backend.Features.Notifications.Controllers;

using backend.Features.Notifications.DTOs;
using backend.Features.Notifications.Services;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly AppDbContext _context;

    public NotificationsController(INotificationService notificationService, AppDbContext context)
    {
        _notificationService = notificationService;
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<NotificationDto>>> GetMyNotifications()
    {
        var farmerId = await ResolveFarmerIdAsync();
        if (farmerId == null)
        {
            return Ok(new List<NotificationDto>());
        }

        var notifications = await _notificationService.GetFarmerNotificationsAsync(farmerId.Value);
        return Ok(notifications);
    }

    [HttpPut("{id}/read")]
    [AllowAnonymous]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var farmerId = await ResolveFarmerIdAsync();
        if (farmerId == null)
        {
            return Ok(new { success = true });
        }

        var success = await _notificationService.MarkAsReadAsync(id, farmerId.Value);
        if (!success)
        {
            return NotFound(new { message = "Notification not found." });
        }

        return Ok(new { success = true });
    }

    [HttpPut("read-all")]
    [AllowAnonymous]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var farmerId = await ResolveFarmerIdAsync();
        if (farmerId == null)
        {
            return Ok(new { success = true });
        }

        await _notificationService.MarkAllAsReadAsync(farmerId.Value);
        return Ok(new { success = true });
    }

    [HttpPost]
    public async Task<ActionResult<NotificationDto>> Create([FromBody] CreateNotificationRequest request)
    {
        var farmerId = request.FarmerId ?? await ResolveFarmerIdAsync();
        if (farmerId == null)
        {
            return BadRequest(new { message = "FarmerId is required." });
        }

        var created = await _notificationService.CreateNotificationAsync(request with { FarmerId = farmerId });
        return CreatedAtAction(nameof(GetMyNotifications), new { id = created.Id }, created);
    }

    private async Task<Guid?> ResolveFarmerIdAsync()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(idClaim, out var parsedId))
        {
            // Verify if this is directly a Farmer ID
            var isFarmer = await _context.Farmers.AnyAsync(f => f.Id == parsedId);
            if (isFarmer)
            {
                return parsedId;
            }

            // Or if it's a User ID linked to a farmer
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == parsedId);
            if (user != null)
            {
                var farmerByPhone = await _context.Farmers.FirstOrDefaultAsync(f => f.Email == user.Email);
                if (farmerByPhone != null)
                {
                    return farmerByPhone.Id;
                }
            }
        }

        var phoneClaim = User.FindFirstValue(ClaimTypes.MobilePhone) ?? User.FindFirstValue("phone");
        if (!string.IsNullOrEmpty(phoneClaim))
        {
            var farmer = await _context.Farmers.FirstOrDefaultAsync(f => f.Phone == phoneClaim);
            if (farmer != null)
            {
                return farmer.Id;
            }
        }

        return null;
    }
}
