using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Features.Logistics.Entities;
using backend.Features.Procurement.DTOs;
using backend.Features.Procurement.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Procurement.Services;

public class PurchaseRequestService : IPurchaseRequestService
{
    private readonly AppDbContext _context;

    public PurchaseRequestService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<PurchaseRequestResponseDto>> GetAllAsync(string? status = null, string? processorId = null)
    {
        var query = _context.PurchaseRequests.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "ALL")
        {
            query = query.Where(r => r.Status.ToUpper() == status.ToUpper());
        }

        if (!string.IsNullOrWhiteSpace(processorId))
        {
            query = query.Where(r => r.ProcessorId == processorId);
        }

        var list = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
        var shipmentIds = list.Where(r => r.ShipmentId.HasValue).Select(r => r.ShipmentId!.Value).ToList();
        var dispatches = await _context.Dispatches
            .Where(d => shipmentIds.Contains(d.Id))
            .ToDictionaryAsync(d => d.Id);

        return list.Select(r => MapToDto(r, r.ShipmentId.HasValue && dispatches.ContainsKey(r.ShipmentId.Value) ? dispatches[r.ShipmentId.Value] : null)).ToList();
    }

    public async Task<PurchaseRequestResponseDto?> GetByIdAsync(Guid id)
    {
        var request = await _context.PurchaseRequests.FirstOrDefaultAsync(r => r.Id == id);
        if (request == null) return null;

        Dispatch? dispatch = null;
        if (request.ShipmentId.HasValue)
        {
            dispatch = await _context.Dispatches.FirstOrDefaultAsync(d => d.Id == request.ShipmentId.Value);
        }

        return MapToDto(request, dispatch);
    }

    public async Task<PurchaseRequestResponseDto?> GetByCodeOrAgreementIdAsync(string identifier)
    {
        var request = await _context.PurchaseRequests
            .FirstOrDefaultAsync(r => r.RequestCode == identifier || r.AgreementId == identifier || r.Id.ToString() == identifier);
        
        if (request == null) return null;

        Dispatch? dispatch = null;
        if (request.ShipmentId.HasValue)
        {
            dispatch = await _context.Dispatches.FirstOrDefaultAsync(d => d.Id == request.ShipmentId.Value);
        }

        return MapToDto(request, dispatch);
    }

    public async Task<PurchaseRequestResponseDto> CreateAsync(CreatePurchaseRequestDto dto, string? processorId = null, string? processorName = null)
    {
        var count = await _context.PurchaseRequests.CountAsync() + 1;
        var requestCode = $"PR-2026-{count:D3}";

        var request = new PurchaseRequest
        {
            Id = Guid.NewGuid(),
            RequestCode = requestCode,
            LotId = dto.LotId,
            MilletType = dto.MilletType,
            RequestedQuantityKg = dto.RequestedQuantityKg,
            IndicativePricePerKg = dto.IndicativePricePerKg,
            IndicativeValue = dto.RequestedQuantityKg * dto.IndicativePricePerKg,
            FpoName = dto.FpoName ?? "Mandya FPO",
            ProcessorId = processorId ?? "proc-001",
            ProcessorName = processorName ?? "Millet Shakti SHG",
            SubmittedDate = DateTime.UtcNow,
            Status = "REQUESTED",
            DeliveryNotes = dto.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.PurchaseRequests.Add(request);
        await _context.SaveChangesAsync();

        return MapToDto(request, null);
    }

    public async Task<PurchaseRequestResponseDto?> ProposeAgreementAsync(Guid id, ProposeAgreementDto dto)
    {
        var request = await _context.PurchaseRequests.FirstOrDefaultAsync(r => r.Id == id);
        if (request == null) return null;

        var count = await _context.PurchaseRequests.CountAsync(r => r.AgreementId != null) + 1;
        request.AgreementId = $"PPA-2026-{count:D3}";
        request.AgreedQuantityKg = dto.AgreedQuantityKg;
        request.SellingPricePerKg = dto.SellingPricePerKg;
        request.TotalValue = dto.AgreedQuantityKg * dto.SellingPricePerKg;
        request.AgreementValidUntil = dto.AgreementValidUntil ?? DateTime.UtcNow.AddDays(7);
        request.PaymentTerms = dto.PaymentTerms ?? "100% advance before dispatch";
        request.OwnershipTransfer = dto.OwnershipTransfer ?? "After payment confirmation and delivery";
        request.CancellationTerms = dto.CancellationTerms ?? "Subject to agreement terms";
        request.Status = "AGREEMENT_PROPOSED";
        request.DeliveryOtp = "9304";
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(request, null);
    }

    public async Task<PurchaseRequestResponseDto?> AcceptAgreementAsync(Guid id)
    {
        var request = await _context.PurchaseRequests.FirstOrDefaultAsync(r => r.Id == id);
        if (request == null) return null;

        request.Status = "ACCEPTED";
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(request, null);
    }

    public async Task<PurchaseRequestResponseDto?> ProcessPaymentAsync(Guid id, ProcessPaymentDto dto)
    {
        var request = await _context.PurchaseRequests.FirstOrDefaultAsync(r => r.Id == id);
        if (request == null) return null;

        var numStr = request.RequestCode.Replace("PR-2026-", "");
        request.PaymentStatus = "PAID";
        request.PaymentMethod = dto.PaymentMethod;
        request.PaymentTransactionId = dto.TransactionId ?? $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}";
        request.PaymentDate = DateTime.UtcNow;
        request.InvoiceNumber = $"INV-2026-{numStr}";
        request.DeliveryChallanNumber = $"DC-2026-{numStr}";
        request.Status = "PAID";
        request.DeliveryOtp = request.DeliveryOtp ?? "9304";
        request.UpdatedAt = DateTime.UtcNow;

        // If an outbound dispatch already exists for this shipment, update it; otherwise create a new one
        Dispatch? dispatch = null;
        if (request.ShipmentId.HasValue)
        {
            dispatch = await _context.Dispatches.FirstOrDefaultAsync(d => d.Id == request.ShipmentId.Value);
        }

        var destinationAddr = !string.IsNullOrWhiteSpace(dto.DeliveryAddress)
            ? dto.DeliveryAddress
            : "Millet Shakti Processing Unit, GIDC Phase 2, Vatva, Ahmedabad, Gujarat - 382445";
        var destLat = dto.DestinationLatitude ?? 22.9754m;
        var destLng = dto.DestinationLongitude ?? 72.6322m;
        var pickupLat = 22.5645m;
        var pickupLng = 72.9289m;

        if (dispatch == null)
        {
            // Automatically schedule outbound dispatch without auto-assigning driver
            dispatch = new Dispatch
            {
                Id = Guid.NewGuid(),
                DispatchCode = $"DSP-2026-{numStr}",
                LotId = request.LotId,
                AgreementId = request.AgreementId ?? "PPA-2026-004",
                TotalQuantityKg = request.AgreedQuantityKg ?? request.RequestedQuantityKg,
                MilletType = request.MilletType,
                Direction = "OUTBOUND",
                FarmerOrProcessorName = request.ProcessorName,
                ProcessorType = "SHG",
                SourceAddress = "Gujarat FPO Central Storage, Anand, Gujarat",
                DestinationAddress = destinationAddr,
                PickupLatitude = pickupLat,
                PickupLongitude = pickupLng,
                DestinationLatitude = destLat,
                DestinationLongitude = destLng,
                TransportResponsibility = "FPO_MANAGED",
                VehicleNumber = "",
                VehicleCapacityKg = 7000,
                DriverName = "",
                DriverPhone = "",
                DriverLatitude = null,
                DriverLongitude = null,
                DriverAccuracyMeters = null,
                DriverLastUpdated = null,
                VerificationCode = request.DeliveryOtp ?? "9304",
                ScheduledDate = DateTime.UtcNow,
                ScheduledStartTime = "09:00 AM",
                ScheduledEndTime = "02:00 PM",
                Status = "SCHEDULED",
                CreatedAt = DateTime.UtcNow
            };

            _context.Dispatches.Add(dispatch);
            request.ShipmentId = dispatch.Id;
            request.DispatchCode = dispatch.DispatchCode;
        }
        else
        {
            dispatch.DestinationAddress = destinationAddr;
            dispatch.DestinationLatitude = destLat;
            dispatch.DestinationLongitude = destLng;
            if (!dispatch.PickupLatitude.HasValue) dispatch.PickupLatitude = pickupLat;
            if (!dispatch.PickupLongitude.HasValue) dispatch.PickupLongitude = pickupLng;
        }

        await _context.SaveChangesAsync();

        return MapToDto(request, dispatch);
    }

    public async Task<PurchaseRequestResponseDto?> ConfirmDeliveryAsync(Guid id, ConfirmProcessorDeliveryDto dto)
    {
        var request = await _context.PurchaseRequests.FirstOrDefaultAsync(r => r.Id == id || r.RequestCode == id.ToString());
        if (request == null) return null;

        var expectedOtp = request.DeliveryOtp ?? "9304";
        if (dto.Otp?.Trim() != expectedOtp.Trim())
        {
            throw new ArgumentException($"Invalid OTP entered. Expected {expectedOtp}.");
        }

        request.Status = "DELIVERED";
        request.DeliveryProofPhotoUrl = dto.PhotoUrl ?? "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80";
        request.DeliveredAt = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(dto.Notes))
        {
            request.DeliveryNotes = dto.Notes;
        }
        request.UpdatedAt = DateTime.UtcNow;

        if (request.ShipmentId.HasValue)
        {
            var dispatch = await _context.Dispatches.FirstOrDefaultAsync(d => d.Id == request.ShipmentId.Value);
            if (dispatch != null)
            {
                dispatch.Status = "DELIVERED";
                dispatch.DeliveredDate = DateTime.UtcNow;
                dispatch.FinalReceivedQuantityKg = request.AgreedQuantityKg ?? request.RequestedQuantityKg;

                // Free up driver
                if (!string.IsNullOrWhiteSpace(dispatch.DriverPhone))
                {
                    var driver = await _context.Drivers.FirstOrDefaultAsync(drv => drv.Phone == dispatch.DriverPhone || drv.Name == dispatch.DriverName);
                    if (driver != null)
                    {
                        driver.Status = "AVAILABLE";
                    }
                }
            }
        }

        await _context.SaveChangesAsync();

        Dispatch? dsp = null;
        if (request.ShipmentId.HasValue)
        {
            dsp = await _context.Dispatches.FirstOrDefaultAsync(d => d.Id == request.ShipmentId.Value);
        }

        return MapToDto(request, dsp);
    }

    private static PurchaseRequestResponseDto MapToDto(PurchaseRequest r, Dispatch? d)
    {
        return new PurchaseRequestResponseDto(
            r.Id,
            r.RequestCode,
            r.LotId,
            r.MilletType,
            r.RequestedQuantityKg,
            r.IndicativePricePerKg,
            r.IndicativeValue,
            r.FpoName,
            r.ProcessorId,
            r.ProcessorName,
            r.SubmittedDate,
            r.Status,
            r.AgreementId,
            r.AgreedQuantityKg,
            r.SellingPricePerKg,
            r.TotalValue,
            r.AgreementValidUntil,
            r.PaymentTerms,
            r.OwnershipTransfer,
            r.CancellationTerms,
            r.PaymentStatus,
            r.PaymentMethod,
            r.PaymentTransactionId,
            r.PaymentDate,
            r.InvoiceNumber,
            r.ShipmentId,
            r.DispatchCode,
            r.DeliveryChallanNumber,
            r.DeliveryOtp,
            r.DeliveryProofPhotoUrl,
            r.DeliveredAt,
            r.DeliveryNotes,
            !string.IsNullOrWhiteSpace(d?.DriverName) ? d.DriverName : null,
            !string.IsNullOrWhiteSpace(d?.DriverPhone) ? d.DriverPhone : null,
            !string.IsNullOrWhiteSpace(d?.VehicleNumber) ? d.VehicleNumber : null,
            d?.Status ?? r.Status,
            d?.DriverLatitude,
            d?.DriverLongitude
        );
    }
}
