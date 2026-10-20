using Microsoft.AspNetCore.Mvc;
using backend.Features.Support.DTOs;
using backend.Features.Support.Services;

namespace backend.Features.Support.Controllers;

[ApiController]
[Route("api/support/chat")]
public class SupportChatController : ControllerBase
{
    private readonly ISupportChatService _chatService;
    private readonly ILogger<SupportChatController> _logger;

    public SupportChatController(ISupportChatService chatService, ILogger<SupportChatController> logger)
    {
        _chatService = chatService;
        _logger = logger;
    }

    [HttpPost("connect")]
    public async Task<ActionResult<List<ChatMessageDto>>> Connect([FromBody] ConnectSessionRequest request, CancellationToken ct)
    {
        try
        {
            var messages = await _chatService.ConnectSessionAsync(request, ct);
            return Ok(messages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error connecting Akka chat session for {SessionId}", request.SessionId);
            return StatusCode(500, new { message = "Failed to establish Akka.NET chat connection", error = ex.Message });
        }
    }

    [HttpPost("send")]
    public async Task<ActionResult<List<ChatMessageDto>>> SendMessage([FromBody] SendMessageRequest request, CancellationToken ct)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { message = "Message content cannot be empty" });
            }

            var messages = await _chatService.SendMessageAsync(request, ct);
            return Ok(messages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat message for {SessionId}", request.SessionId);
            return StatusCode(500, new { message = "Failed to deliver message via actor", error = ex.Message });
        }
    }

    [HttpGet("messages")]
    public async Task<ActionResult<List<ChatMessageDto>>> GetMessages([FromQuery] string sessionId, CancellationToken ct)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return BadRequest(new { message = "Session ID is required" });
            }

            var messages = await _chatService.GetPendingMessagesAsync(sessionId, ct);
            return Ok(messages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving messages for {SessionId}", sessionId);
            return StatusCode(500, new { message = "Failed to read ephemeral queue", error = ex.Message });
        }
    }

    [HttpPost("reset")]
    public async Task<ActionResult<List<ChatMessageDto>>> ResetSession([FromBody] ResetSessionRequest request, CancellationToken ct)
    {
        try
        {
            var messages = await _chatService.ResetSessionAsync(request.SessionId, ct);
            return Ok(messages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting session {SessionId}", request.SessionId);
            return StatusCode(500, new { message = "Failed to reset session actor", error = ex.Message });
        }
    }

    [HttpGet("journey-stages")]
    public ActionResult<List<JourneyStageDto>> GetJourneyStages([FromQuery] string? role)
    {
        var stages = _chatService.GetJourneyStagesForRole(role ?? "Farmer");
        return Ok(stages);
    }
}
