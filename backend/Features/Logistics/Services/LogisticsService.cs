using backend.Data;
using backend.Features.Logistics.DTOs;
using backend.Features.Logistics.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Logistics.Services;

public interface ILogisticsService
{
    Task<List<DispatchResponse>> GetAllAsync();
    Task<DispatchResponse?> GetByIdAsync(Guid id);
    Task<DispatchResponse> CreateAsync(CreateDispatchRequest request);
    Task<DispatchResponse> UpdateStatusAsync(Guid id, string status);
}

public class LogisticsService : ILogisticsService
{
    private readonly AppDbContext _context;

    public LogisticsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<DispatchResponse>> GetAllAsync()
    {
        var dispatches = await _context.Dispatches
            .Include(d => d.Warehouse)
            .OrderByDescending(d => d.ScheduledDate)
            .ToListAsync();

        return dispatches.Select(Map).ToList();
    }

    public async Task<DispatchResponse?> GetByIdAsync(Guid id)
    {
        var dispatch = await _context.Dispatches.Include(d => d.Warehouse).FirstOrDefaultAsync(d => d.Id == id);
        return dispatch is null ? null : Map(dispatch);
    }

    public async Task<DispatchResponse> CreateAsync(CreateDispatchRequest request)
    {
        var warehouse = await _context.Warehouses.FindAsync(request.WarehouseId);
        if (warehouse is null) throw new KeyNotFoundException("Warehouse not found.");

        var dispatch = new Dispatch
        {
            Id = Guid.NewGuid(),
            DispatchCode = $"DIS-{Random.Shared.Next(1000, 9999)}",
            WarehouseId = request.WarehouseId,
            Warehouse = warehouse,
            DestinationAddress = request.DestinationAddress,
            VehicleNumber = request.VehicleNumber,
            DriverName = request.DriverName,
            DriverPhone = request.DriverPhone,
            TotalQuantityKg = request.TotalQuantityKg,
            Status = "PENDING",
            ScheduledDate = request.ScheduledDate
        };

        _context.Dispatches.Add(dispatch);
        await _context.SaveChangesAsync();
        return Map(dispatch);
    }

    public async Task<DispatchResponse> UpdateStatusAsync(Guid id, string status)
    {
        var dispatch = await _context.Dispatches.Include(d => d.Warehouse).FirstOrDefaultAsync(d => d.Id == id);
        if (dispatch is null) throw new KeyNotFoundException("Dispatch not found.");

        dispatch.Status = status;
        if (status == "DELIVERED") dispatch.DeliveredDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Map(dispatch);
    }

    private static DispatchResponse Map(Dispatch d) => new(
        d.Id, d.DispatchCode, d.WarehouseId, d.Warehouse?.Name ?? "", d.DestinationAddress,
        d.VehicleNumber, d.DriverName, d.DriverPhone, d.TotalQuantityKg, d.Status, d.ScheduledDate, d.DeliveredDate);
}
