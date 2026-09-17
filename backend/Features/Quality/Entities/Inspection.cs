namespace backend.Features.Quality.Entities;

using backend.Features.Procurement.Entities;

public class Inspection
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid LotId { get; set; }
    public ProcurementLot Lot { get; set; } = null!;

    public string InspectorName { get; set; } = string.Empty;

    public decimal MoisturePercentage { get; set; }

    public decimal PurityPercentage { get; set; }

    public string Grade { get; set; } = "A"; // Grade A, B, C, Rejected

    public string Status { get; set; } = "PASSED"; // PASSED, FAILED, PENDING

    public string Notes { get; set; } = string.Empty;

    public DateTime InspectionDate { get; set; } = DateTime.UtcNow;
}

public class QualityCertificate
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string CertificateNumber { get; set; } = string.Empty;

    public Guid LotId { get; set; }
    public ProcurementLot Lot { get; set; } = null!;

    public string IssuedBy { get; set; } = string.Empty;

    public DateTime IssueDate { get; set; } = DateTime.UtcNow;

    public DateTime ValidUntil { get; set; } = DateTime.UtcNow.AddYears(1);

    public string Grade { get; set; } = "Grade A";
}
