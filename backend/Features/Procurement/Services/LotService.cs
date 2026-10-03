using backend.Data;
using backend.Features.Procurement.DTOs;
using backend.Features.Procurement.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Procurement.Services;

public class LotService : ILotService
{
    private readonly AppDbContext _context;

    public LotService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<LotResponse>> GetAllAsync()
    {
        var lots = await _context.ProcurementLots
            .Include(x => x.Farmer)
            .Include(x => x.Farm)
            .Include(x => x.FarmCrop)
            .OrderByDescending(x => x.SubmissionDate)
            .ToListAsync();

        return lots.Select(MapToResponse).ToList();
    }

    public async Task<List<LotResponse>> GetByFarmerIdAsync(Guid farmerId)
    {
        var lots = await _context.ProcurementLots
            .Include(x => x.Farmer)
            .Include(x => x.Farm)
            .Include(x => x.FarmCrop)
            .Where(x => x.FarmerId == farmerId)
            .OrderByDescending(x => x.SubmissionDate)
            .ToListAsync();

        return lots.Select(MapToResponse).ToList();
    }

    public async Task<LotResponse?> GetByIdAsync(Guid id)
    {
        var lot = await _context.ProcurementLots
            .Include(x => x.Farmer)
            .Include(x => x.Farm)
            .FirstOrDefaultAsync(x => x.Id == id);

        return lot is null ? null : MapToResponse(lot);
    }

    public async Task<LotResponse> CreateAsync(
        Guid farmerId,
        CreateLotRequest request)
    {
        var farmer = await _context.Farmers
            .FindAsync(farmerId);
    
        if (farmer is null)
        {
            throw new KeyNotFoundException(
                "Farmer not found.");
        }
    
        // 1. Verify farm belongs to farmer
        var farm = await _context.Farms
            .FirstOrDefaultAsync(f =>
                f.Id == request.FarmId &&
                f.FarmerId == farmerId);
    
        if (farm is null)
        {
            throw new KeyNotFoundException(
                "Farm not found or does not belong to this farmer.");
        }
    
        // 2. Farm must be verified
        if (!string.Equals(
                farm.Status,
                "Verified",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "You can submit a lot only for a verified farm.");
        }
    
        // 3. Verify selected crop belongs to selected farm
        var farmCrop = await _context.FarmCrops
            .FirstOrDefaultAsync(x =>
                x.Id == request.FarmCropId &&
                x.FarmId == farm.Id &&
                x.Status == "Active");
    
        if (farmCrop is null)
        {
            throw new KeyNotFoundException(
                "Selected crop was not found on this farm.");
        }
    
        // 4. Generate lot number
        var lotCount = await _context.ProcurementLots.CountAsync() + 1;
    
        var lotNumber =
            $"{Random.Shared.Next(1000, 9999)}-{(char)('A' + (lotCount % 26))}";
    
        // 5. Create lot
        var lot = new ProcurementLot
        {
            Id = Guid.NewGuid(),
    
            LotNumber = lotNumber,
    
            FarmerId = farmerId,
            Farmer = farmer,
    
            FarmId = farm.Id,
            Farm = farm,
    
            FarmCropId = farmCrop.Id,
            FarmCrop = farmCrop,
    
            EstimatedQuantityKg =
                request.EstimatedQuantityKg,
    
            HarvestDate =
                DateTime.SpecifyKind(
                    request.HarvestDate,
                    DateTimeKind.Utc),
    
            SubmissionDate = DateTime.UtcNow,
    
            Status = "SUBMITTED",
    
            Description = request.Description,
    
            CreatedAt = DateTime.UtcNow,
    
            UpdatedAt = DateTime.UtcNow
        };
    
        _context.ProcurementLots.Add(lot);
    
        await _context.SaveChangesAsync();
    
        return MapToResponse(lot);
    }

    public async Task<LotTimelineResponse?> GetTimelineAsync(Guid lotId)
    {
        var lot = await _context.ProcurementLots.FindAsync(lotId);
        if (lot is null) return null;

        var statusOrder = new[]
        {
            "SUBMITTED",
            "QUALITY_INSPECTION",
            "QUALITY_CERTIFICATE",
            "PROCUREMENT_AGREEMENT",
            "PICKUP",
            "PAYMENT"
        };

        string rawStatus = (lot.Status ?? "SUBMITTED").ToUpperInvariant();

        int currentIndex = rawStatus switch
        {
            "SUBMITTED" or "PENDING" => 0,
            "QUALITY_INSPECTION" or "INSPECTION_IN_PROGRESS" or "PENDING_INSPECTION" => 1,
            "QUALITY_CERTIFIED" or "QUALITY_CERTIFICATE" or "QUALITY_PASSED" or "CERTIFIED" or "APPROVED" => 2,
            "PROCUREMENT_AGREEMENT" or "AGREEMENT_PENDING" or "AGREEMENT_ACCEPTED" => 3,
            "PICKUP" or "PICKUP_SCHEDULED" or "PICKUP_COMPLETED" or "DISPATCHED" or "IN_TRANSIT" => 4,
            "PAYMENT" or "PAYMENT_COMPLETED" or "READY_FOR_PAYMENT" or "SETTLED" or "COMPLETED" => 5,
            _ => 0
        };

        var steps = statusOrder.Select((stepName, index) =>
        {
            string status;
            if (index < currentIndex)
            {
                status = "COMPLETED";
            }
            else if (index == currentIndex)
            {
                if (currentIndex == 2 && (stepName == "QUALITY_INSPECTION" || stepName == "QUALITY_CERTIFICATE"))
                {
                    status = "COMPLETED";
                }
                else if (currentIndex == 0 && stepName == "SUBMITTED")
                {
                    status = "COMPLETED";
                }
                else
                {
                    status = "IN_PROGRESS";
                }
            }
            else
            {
                status = "PENDING";
            }

            DateTime? completedAt = index <= currentIndex ? lot.SubmissionDate.AddDays(index * 2) : null;
            return new LotTimelineStepResponse(stepName, status, completedAt);
        }).ToList();

        return new LotTimelineResponse(lot.Id, lot.Status, steps);
    }

    public async Task<LotResponse?> AssignInspectorAsync(Guid lotId, AssignInspectorRequest request)
    {
        var lot = await _context.ProcurementLots
            .Include(x => x.Farmer)
            .Include(x => x.Farm)
            .Include(x => x.FarmCrop)
            .FirstOrDefaultAsync(x => x.Id == lotId);

        if (lot is null) return null;

        lot.AssignedInspectorId = request.InspectorId ?? Guid.NewGuid();
        lot.AssignedInspectorName = request.InspectorName;
        lot.AssignedInspectorPhone = request.InspectorPhone;
        lot.ScheduledInspectionDate = DateTime.SpecifyKind(request.ScheduledDate, DateTimeKind.Utc);
        lot.InspectionTrackingStatus = "ASSIGNED";
        lot.Status = "QUALITY_INSPECTION";

        // Initial location offset (approx ~3km away) if farm coordinates exist
        decimal farmLat = lot.Farm?.Latitude ?? 18.5204m;
        decimal farmLng = lot.Farm?.Longitude ?? 73.8567m;
        lot.InspectorLatitude = farmLat - 0.025m;
        lot.InspectorLongitude = farmLng - 0.025m;
        lot.InspectorLastUpdated = DateTime.UtcNow;
        lot.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToResponse(lot);
    }

    public async Task<LotResponse?> UpdateInspectorLocationAsync(Guid lotId, UpdateInspectorLocationRequest request)
    {
        var lot = await _context.ProcurementLots
            .Include(x => x.Farmer)
            .Include(x => x.Farm)
            .Include(x => x.FarmCrop)
            .FirstOrDefaultAsync(x => x.Id == lotId);

        if (lot is null) return null;

        if (!string.IsNullOrWhiteSpace(request.TrackingStatus))
        {
            lot.InspectionTrackingStatus = request.TrackingStatus;
        }

        if (request.Latitude.HasValue) lot.InspectorLatitude = request.Latitude.Value;
        if (request.Longitude.HasValue) lot.InspectorLongitude = request.Longitude.Value;
        lot.InspectorLastUpdated = DateTime.UtcNow;
        lot.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToResponse(lot);
    }

    public async Task<bool> AcceptAgreementAsync(Guid lotId)
    {
        var lot = await _context.ProcurementLots.FindAsync(lotId);
        if (lot is null) return false;

        lot.Status = "AGREEMENT_ACCEPTED";
        lot.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectAgreementAsync(Guid lotId, RejectAgreementRequest request)
    {
        var lot = await _context.ProcurementLots.FindAsync(lotId);
        if (lot is null) return false;

        lot.Status = "AGREEMENT_REJECTED";
        lot.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ReschedulePickupAsync(Guid lotId, ReschedulePickupRequest request)
    {
        var lot = await _context.ProcurementLots.FindAsync(lotId);
        if (lot is null) return false;

        lot.Status = "PICKUP_RESCHEDULED";
        lot.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<InspectorResponse>> GetInspectorsAsync()
    {
        var users = await _context.Users
            .Include(u => u.FpoMember)
            .ToListAsync();

        var result = new List<InspectorResponse>();

        var defaultInspectors = new List<InspectorResponse>
        {
            new(Guid.Parse("99999999-1111-1111-1111-111111111111"), "Ananya Roy", "+91 9876543210", "Quality Inspector", "quality@shreeanna.com"),
            new(Guid.Parse("99999999-2222-2222-2222-222222222222"), "Vikram Singh", "+91 9876543211", "Field / Procurement Officer", "procurement@shreeanna.com"),
            new(Guid.Parse("99999999-3333-3333-3333-333333333333"), "Suresh Kumar", "+91 9876543212", "Senior Inspector", "suresh@shreeanna.com"),
            new(Guid.Parse("99999999-4444-4444-4444-444444444444"), "Rajesh Patel", "+91 9876543213", "FPO Manager", "fpo@shreeanna.com")
        };

        foreach (var u in users)
        {
            var name = u.FpoMember?.Name;
            if (string.IsNullOrEmpty(name))
            {
                var parts = u.Email.Split('@')[0].Replace(".", " ");
                name = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(parts);
            }
            var phone = u.FpoMember?.Phone ?? "+91 9876543210";
            result.Add(new InspectorResponse(u.Id, name, phone, string.IsNullOrWhiteSpace(u.Role) ? "Inspector" : u.Role, u.Email));
        }


        foreach (var def in defaultInspectors)
        {
            if (!result.Any(r => r.Name.Equals(def.Name, StringComparison.OrdinalIgnoreCase)))
            {
                result.Add(def);
            }
        }

        return result;
    }


    private static LotResponse MapToResponse(ProcurementLot lot)
    {
        return new LotResponse(
            lot.Id,
            lot.LotNumber,
            lot.FarmerId,
            lot.Farmer?.FullName ?? "Farmer",
            lot.FarmId,
            lot.Farm?.FarmName ?? "Farm",
            lot.FarmCrop?.CropName ?? "Crop",
            lot.EstimatedQuantityKg,
            lot.ActualQuantityKg,
            lot.HarvestDate,
            lot.SubmissionDate,
            lot.Status,
            lot.Description,
            lot.AssignedInspectorName,
            lot.AssignedInspectorPhone,
            lot.ScheduledInspectionDate,
            lot.InspectionTrackingStatus,
            lot.InspectorLatitude,
            lot.InspectorLongitude,
            lot.InspectorLastUpdated,
            lot.Farm?.Latitude,
            lot.Farm?.Longitude,
            lot.Farmer?.Phone,
            lot.Farmer?.Address
        );
    }
}
