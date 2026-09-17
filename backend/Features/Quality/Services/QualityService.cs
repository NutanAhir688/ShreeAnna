using backend.Data;
using backend.Features.Quality.DTOs;
using backend.Features.Quality.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Quality.Services;

public interface IQualityService
{
    Task<List<InspectionResponse>> GetAllInspectionsAsync();
    Task<InspectionResponse?> GetInspectionByLotIdAsync(Guid lotId);
    Task<InspectionResponse> CreateInspectionAsync(CreateInspectionRequest request);
    Task<QualityCertificateResponse?> GetCertificateByLotIdAsync(Guid lotId);
    Task<List<QualityCertificateResponse>> GetAllCertificatesAsync();
}

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
        var lot = await _context.ProcurementLots.FindAsync(request.LotId);
        if (lot is null)
        {
            throw new KeyNotFoundException("Lot not found.");
        }

        var inspection = new Inspection
        {
            Id = Guid.NewGuid(),
            LotId = request.LotId,
            Lot = lot,
            InspectorName = request.InspectorName,
            MoisturePercentage = request.MoisturePercentage,
            PurityPercentage = request.PurityPercentage,
            Grade = request.Grade,
            Status = request.Status,
            Notes = request.Notes,
            InspectionDate = DateTime.UtcNow
        };

        lot.Status = request.Status == "PASSED" ? "QUALITY_CERTIFIED" : "QUALITY_FAILED";
        lot.UpdatedAt = DateTime.UtcNow;

        _context.Inspections.Add(inspection);

        if (request.Status == "PASSED")
        {
            var cert = new QualityCertificate
            {
                Id = Guid.NewGuid(),
                CertificateNumber = $"CERT-{Random.Shared.Next(1000, 9999)}",
                LotId = request.LotId,
                Lot = lot,
                IssuedBy = request.InspectorName,
                IssueDate = DateTime.UtcNow,
                ValidUntil = DateTime.UtcNow.AddYears(1),
                Grade = request.Grade
            };
            _context.QualityCertificates.Add(cert);
        }

        await _context.SaveChangesAsync();

        return MapInspection(inspection);
    }

    public async Task<QualityCertificateResponse?> GetCertificateByLotIdAsync(Guid lotId)
    {
        var cert = await _context.QualityCertificates
            .Include(x => x.Lot)
            .FirstOrDefaultAsync(x => x.LotId == lotId);

        if (cert is null) return null;

        return new QualityCertificateResponse(
            cert.Id,
            cert.CertificateNumber,
            cert.LotId,
            cert.Lot?.LotNumber ?? "",
            cert.IssuedBy,
            cert.IssueDate,
            cert.ValidUntil,
            cert.Grade
        );
    }

    public async Task<List<QualityCertificateResponse>> GetAllCertificatesAsync()
    {
        var certs = await _context.QualityCertificates
            .Include(x => x.Lot)
            .OrderByDescending(x => x.IssueDate)
            .ToListAsync();

        return certs.Select(cert => new QualityCertificateResponse(
            cert.Id,
            cert.CertificateNumber,
            cert.LotId,
            cert.Lot?.LotNumber ?? "",
            cert.IssuedBy,
            cert.IssueDate,
            cert.ValidUntil,
            cert.Grade
        )).ToList();
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
            i.Grade,
            i.Status,
            i.Notes,
            i.InspectionDate
        );
    }
}
