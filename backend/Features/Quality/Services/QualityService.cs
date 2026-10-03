using backend.Data;
using backend.Features.Quality.DTOs;
using backend.Features.Quality.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Quality.Services;

public class QualityService : IQualityService
{
    private readonly AppDbContext _context;

    public QualityService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<InspectionResponse>> GetAllInspectionsAsync()
    {
        var inspections = await _context.Inspections
            .Include(x => x.Lot)
            .OrderByDescending(x => x.InspectionDate)
            .ToListAsync();

        return inspections.Select(MapInspection).ToList();
    }

    public async Task<InspectionResponse?> GetInspectionByLotIdAsync(Guid lotId)
    {
        var inspection = await _context.Inspections
            .Include(x => x.Lot)
            .FirstOrDefaultAsync(x => x.LotId == lotId);

        return inspection is null ? null : MapInspection(inspection);
    }

    public async Task<InspectionResponse> CreateInspectionAsync(CreateInspectionRequest request)
    {
        var lot = await _context.ProcurementLots
            .FirstOrDefaultAsync(x => x.Id == request.LotId);

        if (lot is null)
        {
            throw new KeyNotFoundException("Lot not found.");
        }

        var inspectionStatus = request.Status.ToUpperInvariant();

        if (inspectionStatus is not ("PASSED" or "FAILED" or "PENDING" or "HOLD"))
        {
            throw new ArgumentException("Invalid inspection status.");
        }

        // Check existing inspection
        var existingInspection = await _context.Inspections
            .FirstOrDefaultAsync(x => x.LotId == request.LotId);

        Inspection inspection;

        if (existingInspection != null)
        {
            // Update existing inspection record
            existingInspection.InspectorName = request.InspectorName.Trim();
            existingInspection.MoisturePercentage = request.MoisturePercentage;
            existingInspection.PurityPercentage = request.PurityPercentage;
            existingInspection.ForeignMatterPercentage = request.ForeignMatterPercentage;
            existingInspection.DamagedGrainsPercentage = request.DamagedGrainsPercentage;
            existingInspection.ImmatureGrainsPercentage = request.ImmatureGrainsPercentage;
            existingInspection.InsectDamage = request.InsectDamage;
            existingInspection.Grade = request.Grade.Trim();
            existingInspection.Status = inspectionStatus;
            existingInspection.Notes = request.Notes?.Trim() ?? string.Empty;
            existingInspection.InspectionDate = DateTime.UtcNow;

            inspection = existingInspection;
        }
        else
        {
            // Create new inspection record
            inspection = new Inspection
            {
                Id = Guid.NewGuid(),
                LotId = lot.Id,
                InspectorName = request.InspectorName.Trim(),
                MoisturePercentage = request.MoisturePercentage,
                PurityPercentage = request.PurityPercentage,
                ForeignMatterPercentage = request.ForeignMatterPercentage,
                DamagedGrainsPercentage = request.DamagedGrainsPercentage,
                ImmatureGrainsPercentage = request.ImmatureGrainsPercentage,
                InsectDamage = request.InsectDamage,
                Grade = request.Grade.Trim(),
                Status = inspectionStatus,
                Notes = request.Notes?.Trim() ?? string.Empty,
                InspectionDate = DateTime.UtcNow
            };
            _context.Inspections.Add(inspection);
        }

        lot.Status = inspectionStatus switch
        {
            "PASSED" => "QUALITY_CERTIFIED",
            "FAILED" => "QUALITY_FAILED",
            _ => "QUALITY_INSPECTION"
        };

        lot.ActualQuantityKg ??= lot.EstimatedQuantityKg;
        lot.UpdatedAt = DateTime.UtcNow;

        if (inspectionStatus == "PASSED")
        {
            var existingCert = await _context.QualityCertificates.FirstOrDefaultAsync(x => x.LotId == lot.Id);
            if (existingCert == null)
            {
                var certificate = new QualityCertificate
                {
                    Id = Guid.NewGuid(),
                    CertificateNumber = $"CERT-{Random.Shared.Next(100000, 999999)}",
                    LotId = lot.Id,
                    IssuedBy = inspection.InspectorName,
                    IssueDate = DateTime.UtcNow,
                    ValidUntil = DateTime.UtcNow.AddYears(1),
                    Grade = inspection.Grade
                };
                _context.QualityCertificates.Add(certificate);
            }
            else
            {
                existingCert.IssuedBy = inspection.InspectorName;
                existingCert.Grade = inspection.Grade;
            }
        }

        await _context.SaveChangesAsync();
        return MapInspection(inspection);
    }

    public async Task<QualityCertificateResponse?> GetCertificateByLotIdAsync(Guid lotId)
    {
        var cert = await _context.QualityCertificates
            .Include(x => x.Lot)
            .ThenInclude(l => l.Farmer)
            .Include(x => x.Lot)
            .ThenInclude(l => l.FarmCrop)
            .FirstOrDefaultAsync(x => x.LotId == lotId);

        if (cert is null) return null;

        var inspection = await _context.Inspections.FirstOrDefaultAsync(x => x.LotId == lotId);

        return MapCertificateResponse(cert, inspection);
    }

    public async Task<List<QualityCertificateResponse>> GetAllCertificatesAsync()
    {
        var certs = await _context.QualityCertificates
            .Include(x => x.Lot)
            .ThenInclude(l => l.Farmer)
            .Include(x => x.Lot)
            .ThenInclude(l => l.FarmCrop)
            .OrderByDescending(x => x.IssueDate)
            .ToListAsync();

        var inspections = await _context.Inspections.ToListAsync();
        var inspectionMap = inspections.ToDictionary(x => x.LotId);

        return certs.Select(cert => {
            inspectionMap.TryGetValue(cert.LotId, out var insp);
            return MapCertificateResponse(cert, insp);
        }).ToList();
    }

    public async Task<QualityCertificateResponse?> VerifyCertificateAsync(string certificateNumber)
    {
        var cert = await _context.QualityCertificates
            .Include(x => x.Lot)
            .ThenInclude(l => l.Farmer)
            .Include(x => x.Lot)
            .ThenInclude(l => l.FarmCrop)
            .FirstOrDefaultAsync(x => x.CertificateNumber.ToLower() == certificateNumber.ToLower());

        if (cert is null) return null;

        var inspection = await _context.Inspections.FirstOrDefaultAsync(x => x.LotId == cert.LotId);

        return MapCertificateResponse(cert, inspection);
    }

    private static InspectionResponse MapInspection(Inspection i)
    {
        return new InspectionResponse(
            i.Id,
            i.LotId,
            i.Lot?.LotNumber ?? "",
            i.InspectorName,
            i.MoisturePercentage,
            i.PurityPercentage,
            i.ForeignMatterPercentage,
            i.DamagedGrainsPercentage,
            i.ImmatureGrainsPercentage,
            i.InsectDamage,
            i.Grade,
            i.Status,
            i.Notes,
            i.InspectionDate
        );
    }

    private static QualityCertificateResponse MapCertificateResponse(QualityCertificate cert, Inspection? insp)
    {
        return new QualityCertificateResponse(
            cert.Id,
            cert.CertificateNumber,
            cert.LotId,
            cert.Lot?.LotNumber ?? "",
            cert.IssuedBy,
            cert.IssueDate,
            cert.ValidUntil,
            cert.Grade,
            cert.Lot?.Farmer?.FullName ?? "Farmer",
            cert.Lot?.FarmCrop?.CropName ?? "Millet",
            cert.Lot?.EstimatedQuantityKg ?? 0,
            insp?.MoisturePercentage,
            insp?.PurityPercentage,
            insp?.ForeignMatterPercentage,
            insp?.DamagedGrainsPercentage,
            insp?.ImmatureGrainsPercentage,
            insp?.InsectDamage,
            insp?.Notes
        );
    }
}
