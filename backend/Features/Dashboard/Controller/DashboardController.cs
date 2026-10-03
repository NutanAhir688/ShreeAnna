using backend.Data;
using backend.Features.Dashboard.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Dashboard.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("recent-activities")]
    public async Task<ActionResult<List<RecentActivityResponse>>>
        GetRecentActivities()
    {
        var activities = new List<RecentActivityResponse>();

        // Recent farm activities
        var farms = await _context.Farms
            .Include(x => x.Farmer)
            .OrderByDescending(x => x.CreatedAt)
            .Take(10)
            .ToListAsync();

        foreach (var farm in farms)
        {
            var isVerified = farm.Status == "Verified";

            activities.Add(new RecentActivityResponse
            {
                Title = isVerified
                    ? $"Farm {farm.FarmCode} verified"
                    : "New farm submitted",

                Subtitle =
                    $"{farm.FarmName} • {farm.Farmer.FullName}",

                CreatedAt = farm.CreatedAt,

                Type = "Farm",

                Status = farm.Status
            });
        }

        // Recent farmer registrations
        var farmers = await _context.Farmers
            .OrderByDescending(x => x.CreatedAt)
            .Take(10)
            .ToListAsync();

        foreach (var farmer in farmers)
        {
            activities.Add(new RecentActivityResponse
            {
                Title = "New farmer registered",

                Subtitle =
                    $"{farmer.FullName} • {farmer.FarmerCode}",

                CreatedAt = farmer.CreatedAt,

                Type = "Farmer",

                Status = farmer.Status
            });
        }

        var result = activities
            .OrderByDescending(x => x.CreatedAt)
            .Take(5)
            .ToList();

        return Ok(result);
    }
}