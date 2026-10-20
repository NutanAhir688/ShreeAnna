namespace backend.Features.Support.DTOs;

public class ConnectSessionRequest
{
    public string SessionId { get; set; } = string.Empty;
    public string Role { get; set; } = "Farmer";
    public string UserName { get; set; } = "Farmer Member";
    public string JourneyStage { get; set; } = string.Empty;
}

public class SendMessageRequest
{
    public string SessionId { get; set; } = string.Empty;
    public string Sender { get; set; } = "Farmer Member";
    public string Content { get; set; } = string.Empty;
    public string JourneyStage { get; set; } = string.Empty;
    public string Role { get; set; } = "Farmer";
}

public class ResetSessionRequest
{
    public string SessionId { get; set; } = string.Empty;
}

public class ChatMessageDto
{
    public string Id { get; set; } = string.Empty;
    public string Sender { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string JourneyStage { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public bool IsAgent { get; set; }
    public string Role { get; set; } = string.Empty;
}

public class JourneyStageDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> SuggestedPrompts { get; set; } = new();
}

public class InspectorConversationDto
{
    public string SessionId { get; set; } = string.Empty;
    public Guid LotId { get; set; }
    public string LotNumber { get; set; } = string.Empty;
    public Guid FarmerId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public string FarmerPhone { get; set; } = string.Empty;
    public string Village { get; set; } = string.Empty;
    public string Taluka { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string CropName { get; set; } = string.Empty;
    public decimal EstimatedQuantityKg { get; set; }
    public string Status { get; set; } = string.Empty;
    public string InspectionTrackingStatus { get; set; } = string.Empty;
    public DateTime? ScheduledInspectionDate { get; set; }
    public string AssignedInspectorName { get; set; } = string.Empty;
    public string LastMessage { get; set; } = string.Empty;
    public DateTime LastMessageTimestamp { get; set; } = DateTime.UtcNow;
    public int UnreadCount { get; set; } = 0;
}
