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
    Task<DispatchResponse?> GetByIdOrCodeAsync(string idOrCode);
    Task<DispatchResponse> CreateAsync(CreateDispatchRequest request);
    Task<DispatchResponse> UpdateStatusAsync(Guid id, string status);
    Task<DispatchResponse> ConfirmDeliveryAsync(Guid id, ConfirmDeliveryRequest request);
    Task<ShipmentIssueResponse> ReportIssueAsync(Guid? id, ReportIssueRequest request);
    Task<List<DriverResponse>> GetDriversAsync();
    Task<DriverResponse> CreateDriverAsync(CreateDriverRequest request);
    Task<DispatchResponse> VerifyPickupAsync(Guid dispatchId, string code);
    Task<List<DispatchResponse>> GetDriverDispatchesAsync(string? phoneOrName);
    Task<DispatchResponse> ConfirmWarehouseReceiptAsync(Guid id);
    Task<DispatchResponse?> GetByLotIdAsync(string lotId);
    Task<DispatchResponse> AssignDriverAsync(Guid id, AssignDriverRequest request);
    Task<DispatchResponse> AbortRideAsync(Guid id, string reason);
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

    public async Task<DispatchResponse?> GetByIdOrCodeAsync(string idOrCode)
    {
        if (Guid.TryParse(idOrCode, out var guidId))
        {
            var dispatch = await _context.Dispatches
                .Include(d => d.Warehouse)
                .FirstOrDefaultAsync(d => d.Id == guidId);
            if (dispatch != null) return Map(dispatch);
        }

        var byCode = await _context.Dispatches
            .Include(d => d.Warehouse)
            .FirstOrDefaultAsync(d => d.DispatchCode.ToLower() == idOrCode.ToLower() || d.LotId == idOrCode);
        if (byCode != null) return Map(byCode);

        // Fallback for mock/demo slugs like "shp-1", "shp-2" -> provide the first real active dispatch
        if (idOrCode.StartsWith("shp-", StringComparison.OrdinalIgnoreCase))
        {
            var first = await _context.Dispatches
                .Include(d => d.Warehouse)
                .OrderByDescending(d => d.CreatedAt)
                .FirstOrDefaultAsync();
            if (first != null) return Map(first);
        }

        return null;
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
            VehicleNumber = string.IsNullOrWhiteSpace(request.VehicleNumber) ? null : request.VehicleNumber,
            VehicleCapacityKg = request.VehicleCapacityKg ?? 7000,
            DriverName = string.IsNullOrWhiteSpace(request.DriverName) ? null : request.DriverName,
            DriverPhone = string.IsNullOrWhiteSpace(request.DriverPhone) ? null : request.DriverPhone,
            VerificationCode = Random.Shared.Next(1000, 9999).ToString(),
            TotalQuantityKg = request.TotalQuantityKg > 0 ? request.TotalQuantityKg : 3500,
            Status = string.IsNullOrWhiteSpace(request.DriverName) ? "SCHEDULED" : "VEHICLE_ASSIGNED",
            WarehouseReceiptStatus = "PENDING",
            ScheduledDate = request.ScheduledDate != default ? request.ScheduledDate : DateTime.UtcNow.AddDays(1),
            ScheduledStartTime = request.ScheduledStartTime ?? "09:00 AM",
            ScheduledEndTime = request.ScheduledEndTime ?? "11:00 AM",
            SpecialInstructions = request.SpecialInstructions ?? "",
            PickupLatitude = request.PickupLatitude,
            PickupLongitude = request.PickupLongitude,
            DestinationLatitude = request.DestinationLatitude ?? warehouse?.Latitude,
            DestinationLongitude = request.DestinationLongitude ?? warehouse?.Longitude,
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
                if ((dispatch.PickupLatitude == null || dispatch.PickupLatitude == 0) && lot.FarmId != Guid.Empty)
                {
                    var farm = await _context.Farms.FindAsync(lot.FarmId);
                    if (farm != null && farm.Latitude != 0)
                    {
                        dispatch.PickupLatitude = farm.Latitude;
                        dispatch.PickupLongitude = farm.Longitude;
                    }
                }
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

        if (!string.IsNullOrWhiteSpace(dispatch.DriverPhone))
        {
            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Phone == dispatch.DriverPhone || d.Name == dispatch.DriverName);
            if (driver != null)
            {
                driver.Status = "AVAILABLE";
            }
        }

        // Also update any linked purchase request
        var pr = await _context.PurchaseRequests.FirstOrDefaultAsync(r => r.ShipmentId == dispatch.Id || r.DispatchCode == dispatch.DispatchCode);
        if (pr != null)
        {
            pr.Status = "DELIVERED";
            pr.DeliveredAt = DateTime.UtcNow;
            pr.UpdatedAt = DateTime.UtcNow;
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

    public async Task<List<DriverResponse>> GetDriversAsync()
    {
        var drivers = await _context.Drivers
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        var inTransitDriverPhones = await _context.Dispatches
            .Where(d => d.Status == "IN_TRANSIT" || d.Status == "DISPATCHED" || d.Status == "PICKED_UP")
            .Select(d => d.DriverPhone)
            .ToListAsync();

        return drivers.Select(d =>
        {
            var status = d.Status ?? "AVAILABLE";
            if (status != "INACTIVE" && status != "OFF_DUTY" && !string.IsNullOrWhiteSpace(d.Phone) && inTransitDriverPhones.Contains(d.Phone))
            {
                status = "IN_TRANSIT";
            }
            return new DriverResponse(
                d.Id,
                d.DriverCode,
                d.Name,
                d.Phone,
                d.LicenseNumber,
                d.VehicleNumber,
                d.VehicleCapacityKg,
                status,
                d.CreatedAt
            );
        }).ToList();
    }

    public async Task<DispatchResponse> AssignDriverAsync(Guid id, AssignDriverRequest request)
    {
        var dispatch = await _context.Dispatches
            .Include(d => d.Warehouse)
            .FirstOrDefaultAsync(d => d.Id == id);
        if (dispatch is null) throw new KeyNotFoundException("Dispatch not found.");

        Driver? driver = null;
        if (request.DriverId.HasValue && request.DriverId.Value != Guid.Empty)
        {
            driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Id == request.DriverId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(request.DriverPhone))
        {
            driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Phone == request.DriverPhone.Trim());
        }
        else if (!string.IsNullOrWhiteSpace(request.DriverName))
        {
            driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Name.ToLower() == request.DriverName.Trim().ToLower());
        }

        if (driver == null)
        {
            throw new KeyNotFoundException("Driver not found in system records.");
        }

        var drvStatus = (driver.Status ?? "AVAILABLE").ToUpper();
        if (drvStatus == "INACTIVE" || drvStatus == "OFF_DUTY" || drvStatus == "SUSPENDED")
        {
            throw new InvalidOperationException($"Cannot assign driver {driver.Name}: Driver is currently INACTIVE ({driver.Status}).");
        }

        var isDriverInTransit = await _context.Dispatches.AnyAsync(d =>
            d.Id != id &&
            (d.Status == "IN_TRANSIT" || d.Status == "DISPATCHED" || d.Status == "PICKED_UP") &&
            (d.DriverPhone == driver.Phone || (d.DriverName != "" && d.DriverName.ToLower() == driver.Name.ToLower()))
        );

        if (isDriverInTransit || drvStatus == "IN_TRANSIT" || drvStatus == "ON_JOURNEY")
        {
            throw new InvalidOperationException($"Cannot assign driver {driver.Name}: Driver is currently IN TRANSIT on another active shipment.");
        }

        dispatch.DriverName = driver.Name;
        dispatch.DriverPhone = driver.Phone;
        dispatch.VehicleNumber = !string.IsNullOrWhiteSpace(request.VehicleNumber) ? request.VehicleNumber : driver.VehicleNumber;
        dispatch.VehicleCapacityKg = request.VehicleCapacityKg ?? driver.VehicleCapacityKg;
        dispatch.Status = "VEHICLE_ASSIGNED";
        dispatch.DriverLatitude = 22.5645m;
        dispatch.DriverLongitude = 72.9289m;
        dispatch.DriverAccuracyMeters = 5.0m;
        dispatch.DriverLastUpdated = DateTime.UtcNow;

        driver.Status = "ASSIGNED";

        // Also update any linked purchase request
        var pr = await _context.PurchaseRequests.FirstOrDefaultAsync(r => r.ShipmentId == dispatch.Id || r.DispatchCode == dispatch.DispatchCode);
        if (pr != null)
        {
            pr.Status = "VEHICLE_ASSIGNED";
            pr.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Map(dispatch);
    }

    public async Task<DispatchResponse> AbortRideAsync(Guid id, string reason)
    {
        var dispatch = await _context.Dispatches
            .Include(d => d.Warehouse)
            .FirstOrDefaultAsync(d => d.Id == id);
        if (dispatch is null) throw new KeyNotFoundException("Dispatch not found.");

        dispatch.Status = "PENDING_DISPATCH";
        dispatch.SpecialInstructions = string.IsNullOrWhiteSpace(dispatch.SpecialInstructions)
            ? $"[ABORTED]: {reason}"
            : $"{dispatch.SpecialInstructions} | [ABORTED]: {reason}";

        // Free up the driver
        if (!string.IsNullOrWhiteSpace(dispatch.DriverPhone))
        {
            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Phone == dispatch.DriverPhone || d.Name == dispatch.DriverName);
            if (driver != null)
            {
                driver.Status = "AVAILABLE";
            }
        }

        // Also update any linked purchase request
        var pr = await _context.PurchaseRequests.FirstOrDefaultAsync(r => r.ShipmentId == dispatch.Id || r.DispatchCode == dispatch.DispatchCode);
        if (pr != null)
        {
            pr.Status = "PENDING_DISPATCH";
            pr.UpdatedAt = DateTime.UtcNow;
        }

        // Log shipment issue automatically
        var issue = new ShipmentIssue
        {
            Id = Guid.NewGuid(),
            DispatchId = dispatch.Id,
            ReferenceType = "Dispatch",
            ReferenceId = dispatch.DispatchCode,
            FarmerName = dispatch.FarmerOrProcessorName,
            DriverName = dispatch.DriverName,
            IssueCategory = "Journey Aborted / Route Emergency",
            IncidentDateTime = DateTime.UtcNow,
            PriorityLevel = "High",
            Subject = $"Journey Aborted for {dispatch.DispatchCode}",
            DetailedDescription = reason,
            Status = "OPEN",
            ReportedAt = DateTime.UtcNow
        };
        _context.ShipmentIssues.Add(issue);

        // Reset driver assignment on dispatch
        dispatch.DriverName = "";
        dispatch.DriverPhone = "";
        dispatch.VehicleNumber = "";

        await _context.SaveChangesAsync();
        return Map(dispatch);
    }

    public async Task<DriverResponse> CreateDriverAsync(CreateDriverRequest request)
    {
        var count = await _context.Drivers.CountAsync() + 1;
        var code = $"DRV-{count:D3}";
        var driver = new Driver
        {
            Id = Guid.NewGuid(),
            DriverCode = code,
            Name = request.Name,
            Phone = request.Phone,
            LicenseNumber = request.LicenseNumber ?? "",
            VehicleNumber = request.VehicleNumber ?? "",
            VehicleCapacityKg = request.VehicleCapacityKg ?? 7000,
            Status = "AVAILABLE",
            CreatedAt = DateTime.UtcNow
        };

        _context.Drivers.Add(driver);
        await _context.SaveChangesAsync();

        return new DriverResponse(
            driver.Id,
            driver.DriverCode,
            driver.Name,
            driver.Phone,
            driver.LicenseNumber,
            driver.VehicleNumber,
            driver.VehicleCapacityKg,
            driver.Status,
            driver.CreatedAt
        );
    }

    public async Task<DispatchResponse> VerifyPickupAsync(Guid dispatchId, string code)
    {
        var dispatch = await _context.Dispatches
            .Include(d => d.Warehouse)
            .FirstOrDefaultAsync(d => d.Id == dispatchId);
        if (dispatch is null) throw new KeyNotFoundException("Dispatch not found.");

        if (dispatch.VerificationCode != code.Trim())
        {
            throw new InvalidOperationException("Invalid pickup code. Please enter the correct 4-digit code provided by the farmer.");
        }

        dispatch.Status = "IN_TRANSIT";

        if (!string.IsNullOrWhiteSpace(dispatch.LotId))
        {
            var lot = await _context.ProcurementLots.FirstOrDefaultAsync(l => l.LotNumber == dispatch.LotId || l.Id.ToString() == dispatch.LotId);
            if (lot != null)
            {
                lot.Status = "IN_TRANSIT";
            }
        }

        if (!string.IsNullOrWhiteSpace(dispatch.DriverPhone))
        {
            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Phone == dispatch.DriverPhone || d.Name == dispatch.DriverName);
            if (driver != null)
            {
                driver.Status = "IN_TRANSIT";
            }
        }

        var pr = await _context.PurchaseRequests.FirstOrDefaultAsync(r => r.ShipmentId == dispatch.Id || r.DispatchCode == dispatch.DispatchCode);
        if (pr != null)
        {
            pr.Status = "IN_TRANSIT";
            pr.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Map(dispatch);
    }

    public async Task<List<DispatchResponse>> GetDriverDispatchesAsync(string? phoneOrName)
    {
        var query = _context.Dispatches.Include(d => d.Warehouse).AsQueryable();

        if (!string.IsNullOrWhiteSpace(phoneOrName))
        {
            var clean = phoneOrName.Trim().ToLower();
            query = query.Where(d => d.DriverPhone.ToLower().Contains(clean) || d.DriverName.ToLower().Contains(clean));
        }

        var list = await query.OrderByDescending(d => d.CreatedAt).ToListAsync();

        if (list.Count == 0)
        {
            list = await _context.Dispatches.Include(d => d.Warehouse).OrderByDescending(d => d.CreatedAt).ToListAsync();
        }

        foreach (var d in list)
        {
            if ((d.PickupLatitude == null || d.PickupLatitude == 0) && !string.IsNullOrWhiteSpace(d.LotId))
            {
                var lot = await _context.ProcurementLots
                    .Include(l => l.Farm)
                    .FirstOrDefaultAsync(l => l.Id.ToString() == d.LotId || l.LotNumber == d.LotId);
                if (lot?.Farm != null && lot.Farm.Latitude != 0)
                {
                    d.PickupLatitude = lot.Farm.Latitude;
                    d.PickupLongitude = lot.Farm.Longitude;
                }
            }
            if (d.DestinationLatitude == null && d.Warehouse != null)
            {
                d.DestinationLatitude = d.Warehouse.Latitude;
                d.DestinationLongitude = d.Warehouse.Longitude;
            }
        }

        return list.Select(Map).ToList();
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
            d.CreatedAt,
            d.PickupLatitude,
            d.PickupLongitude,
            d.DestinationLatitude ?? d.Warehouse?.Latitude,
            d.DestinationLongitude ?? d.Warehouse?.Longitude
        );
    }
    public async Task<DispatchResponse> ConfirmWarehouseReceiptAsync(Guid id)
    {
        var dispatch = await _context.Dispatches
            .Include(d => d.Warehouse)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (dispatch is null)
            throw new KeyNotFoundException("Dispatch not found.");

        if (dispatch.Status != "DELIVERED")
            throw new InvalidOperationException(
                "Delivery must be confirmed before warehouse receipt.");

        dispatch.WarehouseReceiptStatus = "CONFIRMED";

        await _context.SaveChangesAsync();

        return Map(dispatch);
    }
    public async Task<DispatchResponse?> GetByLotIdAsync(string lotId)
    {
        var dispatch = await _context.Dispatches
            .Include(d => d.Warehouse)
            .Where(d => d.LotId == lotId)
            .OrderByDescending(d => d.CreatedAt)
            .FirstOrDefaultAsync();

        return dispatch == null ? null : Map(dispatch);
    }
    
}
