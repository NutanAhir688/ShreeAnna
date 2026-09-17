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
            .OrderByDescending(x => x.SubmissionDate)
            .ToListAsync();

        return lots.Select(MapToResponse).ToList();
    }

    public async Task<List<LotResponse>> GetByFarmerIdAsync(Guid farmerId)
    {
        var lots = await _context.ProcurementLots
            .Include(x => x.Farmer)
            .Include(x => x.Farm)
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

    public async Task<LotResponse> CreateAsync(Guid farmerId, CreateLotRequest request)
    {
        var farmer = await _context.Farmers.FindAsync(farmerId);
        if (farmer is null)
        {
            throw new KeyNotFoundException("Farmer not found.");
        }

        var farm = await _context.Farms.FirstOrDefaultAsync(f => f.Id == request.FarmId && f.FarmerId == farmerId);
        if (farm is null)
        {
            throw new KeyNotFoundException("Farm not found or does not belong to this farmer.");
        }

        var lotCount = await _context.ProcurementLots.CountAsync() + 1;
        var lotNumber = $"{Random.Shared.Next(1000, 9999)}-{(char)('A' + (lotCount % 26))}";

        var lot = new ProcurementLot
        {
            Id = Guid.NewGuid(),
            LotNumber = lotNumber,
            FarmerId = farmerId,
            Farmer = farmer,
            FarmId = request.FarmId,
            Farm = farm,
            MilletType = request.MilletType,
            EstimatedQuantityKg = request.EstimatedQuantityKg,
            HarvestDate = DateTime.SpecifyKind(request.HarvestDate, DateTimeKind.Utc),
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

    private static LotResponse MapToResponse(ProcurementLot lot)
    {
        return new LotResponse(
            lot.Id,
            lot.LotNumber,
            lot.FarmerId,
            lot.Farmer?.FullName ?? "Farmer",
            lot.FarmId,
            lot.Farm?.FarmName ?? "Farm",
            lot.MilletType,
            lot.EstimatedQuantityKg,
            lot.ActualQuantityKg,
            lot.HarvestDate,
            lot.SubmissionDate,
            lot.Status,
            lot.Description
        );
    }
}
