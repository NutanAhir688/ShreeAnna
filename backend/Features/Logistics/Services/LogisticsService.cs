using backend.Data;
using backend.Features.Logistics.DTOs;
using backend.Features.Logistics.Entities;
using backend.Features.Warehouses.Entities;
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
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return dispatches.Select(Map).ToList();
    }

    public async Task<DispatchResponse?> GetByIdAsync(Guid id)
    {
        var dispatch = await _context.Dispatches
            .Include(d => d.Warehouse)
            .FirstOrDefaultAsync(d => d.Id == id);
        return dispatch is null ? null : Map(dispatch);
    }

    public async Task<DispatchResponse> CreateAsync(CreateDispatchRequest request)
    {
        Warehouse? warehouse = null;
        if (request.WarehouseId.HasValue)
        {
            warehouse = await _context.Warehouses.FindAsync(request.WarehouseId.Value);
        }

        var isOutbound = (request.Direction ?? "INBOUND").ToUpper() == "OUTBOUND";
        var prefix = isOutbound ? "SHP-OUT-2026-" : "SHP-2026-";
        var nextNum = await _context.Dispatches.CountAsync() + 1;
        var code = $"{prefix}{nextNum:D3}";

        var dispatch = new Dispatch
        {
            Id = Guid.NewGuid(),
            DispatchCode = code,
            Direction = request.Direction ?? "INBOUND",
            WarehouseId = request.WarehouseId,
            Warehouse = warehouse,
            AgreementId = request.AgreementId ?? (isOutbound ? "PPA-2026-004" : "AGR-2026-001"),
            LotId = request.LotId ?? "LOT-2026-001",
            BatchId = request.BatchId ?? "WB-004",
            FarmerOrProcessorName = request.FarmerOrProcessorName ?? "Ramesh Kumar",
            ProcessorType = request.ProcessorType ?? (isOutbound ? "SHG" : "Farmer"),
            MilletType = request.MilletType ?? "Finger Millet",
            SourceAddress = request.SourceAddress ?? "Mysore District",
            DestinationAddress = request.DestinationAddress ?? "Mandya Warehouse",
            TransportResponsibility = request.TransportResponsibility ?? (isOutbound ? "Processor Pickup" : "FPO Pickup"),
            VehicleNumber = request.VehicleNumber ?? "KA-09-AB-4521",
            VehicleCapacityKg = request.VehicleCapacityKg ?? 7000,
            DriverName = request.DriverName ?? "Ravi Kumar",
            DriverPhone = request.DriverPhone ?? "+91 98765 43210",
            TotalQuantityKg = request.TotalQuantityKg > 0 ? request.TotalQuantityKg : 3500,
            Status = string.IsNullOrWhiteSpace(request.VehicleNumber) ? "SCHEDULED" : "VEHICLE_ASSIGNED",
            WarehouseReceiptStatus = "PENDING",
            ScheduledDate = request.ScheduledDate != default ? request.ScheduledDate : DateTime.UtcNow.AddDays(1),
            ScheduledStartTime = request.ScheduledStartTime ?? "09:00 AM",
            ScheduledEndTime = request.ScheduledEndTime ?? "11:00 AM",
            SpecialInstructions = request.SpecialInstructions ?? "",
            CreatedAt = DateTime.UtcNow
        };

        _context.Dispatches.Add(dispatch);
        await _context.SaveChangesAsync();
        return Map(dispatch);
    }

    public async Task<DispatchResponse> UpdateStatusAsync(Guid id, string status)
    {
        var dispatch = await _context.Dispatches
            .Include(d => d.Warehouse)
            .FirstOrDefaultAsync(d => d.Id == id);
        if (dispatch is null) throw new KeyNotFoundException("Dispatch not found.");

        dispatch.Status = status.ToUpper();
        if (status.ToUpper() == "DELIVERED")
        {
            dispatch.DeliveredDate = DateTime.UtcNow;
            dispatch.FinalReceivedQuantityKg = dispatch.TotalQuantityKg;
        }

        await _context.SaveChangesAsync();
        return Map(dispatch);
    }

    private static DispatchResponse Map(Dispatch d) => new(
        d.Id,
        d.DispatchCode,
        d.Direction ?? "INBOUND",
        d.WarehouseId,
        d.Warehouse?.Name ?? "Mandya Warehouse",
        d.AgreementId ?? "AGR-2026-001",
        d.LotId ?? "LOT-2026-001",
        d.BatchId ?? "WB-004",
        d.FarmerOrProcessorName ?? "Ramesh Kumar",
        d.ProcessorType ?? "Farmer",
        d.MilletType ?? "Finger Millet",
        d.SourceAddress ?? "Mysore District",
        d.DestinationAddress ?? "Mandya Warehouse",
        d.TransportResponsibility ?? "FPO Pickup",
        d.VehicleNumber ?? "KA-09-AB-4521",
        d.VehicleCapacityKg > 0 ? d.VehicleCapacityKg : 7000,
        d.DriverName ?? "Ravi Kumar",
        d.DriverPhone ?? "+91 98765 43210",
        d.TotalQuantityKg > 0 ? d.TotalQuantityKg : 3500,
        d.FinalReceivedQuantityKg,
        d.WarehouseStockAfterDispatchKg,
        d.Status ?? "SCHEDULED",
        d.WarehouseReceiptStatus ?? "PENDING",
        d.ScheduledDate,
        d.ScheduledStartTime ?? "09:00 AM",
        d.ScheduledEndTime ?? "11:00 AM",
        d.SpecialInstructions ?? "",
        d.DeliveredDate,
        d.CreatedAt
    );
}
