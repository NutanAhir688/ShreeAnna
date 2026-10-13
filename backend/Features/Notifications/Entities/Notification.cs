namespace backend.Features.Notifications.Entities;

public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }
    public Guid? FarmerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Category { get; set; } = "General"; // Procurement, Inspection, Logistics, Payment, General
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }
}
