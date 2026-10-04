namespace backend.Features.Logistics.Entities;

public class ShipmentIssue
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? DispatchId { get; set; }
    public string ReferenceType { get; set; } = "Shipment";
    public string ReferenceId { get; set; } = string.Empty;
    public string FarmerName { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public string IssueCategory { get; set; } = string.Empty;
    public DateTime IncidentDateTime { get; set; } = DateTime.UtcNow;
    public string PriorityLevel { get; set; } = "Medium"; // Low, Medium, High, Urgent
    public string Subject { get; set; } = string.Empty;
    public string DetailedDescription { get; set; } = string.Empty;
    public string AttachmentUrlsJson { get; set; } = "[]";
    public string Status { get; set; } = "OPEN";
    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
}
