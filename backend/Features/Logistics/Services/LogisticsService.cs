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
    Task<DispatchResponse> ConfirmDeliveryAsync(Guid id, ConfirmDeliveryRequest request);
    Task<ShipmentIssueResponse> ReportIssueAsync(Guid? id, ReportIssueRequest request);
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
            VerificationCode = Random.Shared.Next(1000, 9999).ToString(),
            TotalQuantityKg = request.TotalQuantityKg > 0 ? request.TotalQuantityKg : 3500,
            Status = string.IsNullOrWhiteSpace(request.VehicleNumber) ? "SCHEDULED" : "VEHICLE_ASSIGNED",
            WarehouseReceiptStatus = "PENDING",
            ScheduledDate = request.ScheduledDate != default ? request.ScheduledDate : DateTime.UtcNow.AddDays(1),
            ScheduledStartTime = request.ScheduledStartTime ?? "09:00 AM",
            ScheduledEndTime = request.ScheduledEndTime ?? "11:00 AM",
            SpecialInstructions = request.SpecialInstructions ?? "",
            CreatedAt = DateTime.UtcNow
        };

        // Update lot status to DISPATCHED in database if lot exists
        if (!string.IsNullOrWhiteSpace(request.LotId) || !string.IsNullOrWhiteSpace(request.AgreementId))
        {
            var lot = await _context.ProcurementLots.FirstOrDefaultAsync(l => 
                l.LotNumber == request.LotId || 
                l.Id.ToString() == request.LotId ||
                (request.LotId != null && l.LotNumber != null && request.LotId.Contains(l.LotNumber)) ||
                (request.AgreementId != null && l.LotNumber != null && request.AgreementId.Contains(l.LotNumber))
            );

            lot ??= await _context.ProcurementLots
                .OrderByDescending(l => l.SubmissionDate)
                .FirstOrDefaultAsync(l => l.Status.Contains("ACCEPTED") || l.Status.Contains("AGREEMENT") || l.Status == "DISPATCHED");

            if (lot != null)
            {
                lot.Status = "DISPATCHED";
                dispatch.LotId = lot.Id.ToString();
            }
        }

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

        var upperStatus = status.ToUpper().Replace(" ", "_");
        dispatch.Status = upperStatus;

        if (upperStatus == "PENDING_DISPATCH" || upperStatus == "ISSUE_FLAGGED" || upperStatus == "FLAGGED_ISSUE" || upperStatus == "ISSUE" || upperStatus == "PENDING")
        {
            dispatch.Status = "PENDING_DISPATCH";
            if (!string.IsNullOrWhiteSpace(dispatch.LotId))
            {
                var lot = await _context.ProcurementLots.FirstOrDefaultAsync(l => l.LotNumber == dispatch.LotId || l.Id.ToString() == dispatch.LotId);
                if (lot != null)
                {
                    lot.Status = "AGREEMENT_ACCEPTED";
                }
            }
        }
        else if (upperStatus == "IN_TRANSIT" || upperStatus == "TRANSIT")
        {
            dispatch.Status = "IN_TRANSIT";
            if (!string.IsNullOrWhiteSpace(dispatch.LotId))
            {
                var lot = await _context.ProcurementLots.FirstOrDefaultAsync(l => l.LotNumber == dispatch.LotId || l.Id.ToString() == dispatch.LotId);
                if (lot != null)
                {
                    lot.Status = "IN_TRANSIT";
                }
            }
        }
        else if (upperStatus == "DELIVERED" || upperStatus == "COMPLETED")
        {
            dispatch.DeliveredDate = DateTime.UtcNow;
            dispatch.FinalReceivedQuantityKg = dispatch.TotalQuantityKg;

            // Also update lot status if present
            if (!string.IsNullOrWhiteSpace(dispatch.LotId))
            {
                var lot = await _context.ProcurementLots.FirstOrDefaultAsync(l => l.LotNumber == dispatch.LotId || l.Id.ToString() == dispatch.LotId);
                if (lot != null)
                {
                    lot.Status = "DELIVERED";
                }
            }
        }

        await _context.SaveChangesAsync();
        return Map(dispatch);
    }

    public async Task<DispatchResponse> ConfirmDeliveryAsync(Guid id, ConfirmDeliveryRequest request)
    {
        var dispatch = await _context.Dispatches
            .Include(d => d.Warehouse)
            .FirstOrDefaultAsync(d => d.Id == id);
        if (dispatch is null) throw new KeyNotFoundException("Dispatch not found.");

        dispatch.Status = "DELIVERED";
        dispatch.DeliveredDate = request.DeliveryDate ?? DateTime.UtcNow;
        dispatch.FinalReceivedQuantityKg = request.DeliveredQuantityKg > 0 ? request.DeliveredQuantityKg : dispatch.TotalQuantityKg;

        if (!string.IsNullOrWhiteSpace(dispatch.LotId))
        {
            var lot = await _context.ProcurementLots.FirstOrDefaultAsync(l => l.LotNumber == dispatch.LotId || l.Id.ToString() == dispatch.LotId);
            if (lot != null)
            {
                lot.Status = "DELIVERED";
            }
        }

        await _context.SaveChangesAsync();
        return Map(dispatch);
    }

    public async Task<ShipmentIssueResponse> ReportIssueAsync(Guid? id, ReportIssueRequest request)
    {
        Dispatch? dispatch = null;
        if (id.HasValue && id.Value != Guid.Empty)
        {
            dispatch = await _context.Dispatches.FirstOrDefaultAsync(d => d.Id == id.Value);
        }
        if (dispatch == null && Guid.TryParse(request.ReferenceId, out var gId))
        {
            dispatch = await _context.Dispatches.FirstOrDefaultAsync(d => d.Id == gId);
        }
        if (dispatch == null && !string.IsNullOrWhiteSpace(request.ReferenceId))
        {
            dispatch = await _context.Dispatches.FirstOrDefaultAsync(d => d.DispatchCode == request.ReferenceId);
        }

        var issue = new ShipmentIssue
        {
            Id = Guid.NewGuid(),
            DispatchId = dispatch?.Id,
            ReferenceType = request.ReferenceType ?? "Shipment",
            ReferenceId = request.ReferenceId ?? (dispatch?.DispatchCode ?? "SHP-2026-001"),
            FarmerName = request.FarmerName ?? (dispatch?.FarmerOrProcessorName ?? ""),
            DriverName = request.DriverName ?? (dispatch?.DriverName ?? ""),
            IssueCategory = request.IssueCategory,
            IncidentDateTime = request.IncidentDateTime != default ? request.IncidentDateTime : DateTime.UtcNow,
            PriorityLevel = request.PriorityLevel ?? "Medium",
            Subject = request.Subject,
            DetailedDescription = request.DetailedDescription,
            AttachmentUrlsJson = System.Text.Json.JsonSerializer.Serialize(request.AttachmentUrls ?? new List<string>()),
            Status = "OPEN",
            ReportedAt = DateTime.UtcNow
        };

        if (dispatch != null)
        {
            dispatch.Status = "PENDING_DISPATCH";
            if (!string.IsNullOrWhiteSpace(dispatch.LotId))
            {
                var lot = await _context.ProcurementLots.FirstOrDefaultAsync(l => l.LotNumber == dispatch.LotId || l.Id.ToString() == dispatch.LotId);
                if (lot != null)
                {
                    lot.Status = "AGREEMENT_ACCEPTED";
                }
            }
        }

        _context.ShipmentIssues.Add(issue);
        await _context.SaveChangesAsync();

        var attachments = new List<string>();
        try
        {
            attachments = System.Text.Json.JsonSerializer.Deserialize<List<string>>(issue.AttachmentUrlsJson) ?? new List<string>();
        }
        catch { }

        return new ShipmentIssueResponse(
            issue.Id,
            issue.DispatchId,
            issue.ReferenceType,
            issue.ReferenceId,
            issue.FarmerName,
            issue.DriverName,
            issue.IssueCategory,
            issue.IncidentDateTime,
            issue.PriorityLevel,
            issue.Subject,
            issue.DetailedDescription,
            attachments,
            issue.Status,
            issue.ReportedAt
        );
    }

    private static DispatchResponse Map(Dispatch d)
    {
        return new(
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
            d.VehicleNumber ?? "",
            d.VehicleCapacityKg > 0 ? d.VehicleCapacityKg : 7000,
            d.DriverName ?? "",
            d.DriverPhone ?? "",
            string.IsNullOrWhiteSpace(d.VerificationCode) ? "4829" : d.VerificationCode,
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
}
