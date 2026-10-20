namespace backend.Features.Support.Actors;

public record ConnectSession(string SessionId, string Role, string UserName, string JourneyStage);

public record SendChatMessage(string SessionId, string Sender, string Content, string JourneyStage);

public record ReceivePendingMessages(string SessionId);

public record ResetUserSession(string SessionId);

public record ChatMessage(
    string Id,
    string Sender,
    string Content,
    string JourneyStage,
    DateTime Timestamp,
    bool IsAgent,
    string Role
);

public record MessagesDeliveredResponse(List<ChatMessage> Messages);

public record SessionStatus(string SessionId, int PendingMessagesCount, string CurrentJourneyStage);
