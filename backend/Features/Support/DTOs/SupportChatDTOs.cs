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
