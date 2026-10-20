using backend.Features.Support.DTOs;

namespace backend.Features.Support.Services;

public interface ISupportChatService
{
    Task<List<ChatMessageDto>> ConnectSessionAsync(ConnectSessionRequest request, CancellationToken ct = default);
    Task<List<ChatMessageDto>> SendMessageAsync(SendMessageRequest request, CancellationToken ct = default);
    Task<List<ChatMessageDto>> GetPendingMessagesAsync(string sessionId, CancellationToken ct = default);
    Task<List<ChatMessageDto>> ResetSessionAsync(string sessionId, CancellationToken ct = default);
    List<JourneyStageDto> GetJourneyStagesForRole(string role);
}
