using Akka.Actor;

namespace backend.Features.Support.Actors;

/// <summary>
/// Lightweight Akka.NET actor running per user/lot connection.
/// Provides complete fault isolation and an ephemeral in-memory message queue.
/// Supports 1-on-1 direct Farmer <-> QualityInspector chat and multi-role operational messaging.
/// </summary>
public class UserSessionActor : ReceiveActor
{
    private readonly string _sessionId;
    private readonly string _role;
    private readonly string _userName;
    private string _currentJourneyStage;
    private readonly Queue<ChatMessage> _ephemeralQueue = new();
    private readonly List<ChatMessage> _messageHistory = new();

    public UserSessionActor(string sessionId, string role, string userName, string initialJourneyStage)
    {
        _sessionId = sessionId;
        _role = string.IsNullOrWhiteSpace(role) ? "Farmer" : role;
        _userName = string.IsNullOrWhiteSpace(userName) ? "Farmer Member" : userName;
        _currentJourneyStage = string.IsNullOrWhiteSpace(initialJourneyStage)
            ? GetDefaultJourneyStage(_role)
            : initialJourneyStage;

        Receive<SendChatMessage>(msg => HandleSendMessage(msg));
        Receive<ReceivePendingMessages>(_ => HandleReceivePending());
        Receive<GetSessionHistory>(_ => Sender.Tell(new MessagesDeliveredResponse(_messageHistory.ToList())));
        Receive<ResetUserSession>(_ => HandleResetSession());
        Receive<ConnectSession>(conn =>
        {
            if (!string.IsNullOrWhiteSpace(conn.JourneyStage))
            {
                _currentJourneyStage = conn.JourneyStage;
            }
            Sender.Tell(new MessagesDeliveredResponse(GetPendingOrRecentMessages()));
        });
    }

    private void HandleSendMessage(SendChatMessage msg)
    {
        if (!string.IsNullOrWhiteSpace(msg.JourneyStage))
        {
            _currentJourneyStage = msg.JourneyStage;
        }

        var senderRole = string.IsNullOrWhiteSpace(msg.Role) ? _role : msg.Role;
        var senderName = string.IsNullOrWhiteSpace(msg.Sender) ? _userName : msg.Sender;

        var chatMsg = new ChatMessage(
            Id: Guid.NewGuid().ToString(),
            Sender: senderName,
            Content: msg.Content,
            JourneyStage: _currentJourneyStage,
            Timestamp: DateTime.UtcNow,
            IsAgent: false,
            Role: senderRole
        );

        _ephemeralQueue.Enqueue(chatMsg);
        _messageHistory.Add(chatMsg);

        // Auto reply completely removed: delivers only the authentic human message
        Sender.Tell(new MessagesDeliveredResponse(new List<ChatMessage> { chatMsg }));
    }

    private void HandleReceivePending()
    {
        var messagesToDeliver = new List<ChatMessage>();
        while (_ephemeralQueue.Count > 0)
        {
            messagesToDeliver.Add(_ephemeralQueue.Dequeue());
        }

        if (messagesToDeliver.Count == 0 && _messageHistory.Count > 0)
        {
            messagesToDeliver.AddRange(_messageHistory.TakeLast(25));
        }

        Sender.Tell(new MessagesDeliveredResponse(messagesToDeliver));
    }

    private void HandleResetSession()
    {
        _ephemeralQueue.Clear();
        _messageHistory.Clear();

        Sender.Tell(new MessagesDeliveredResponse(new List<ChatMessage>()));
    }

    private List<ChatMessage> GetPendingOrRecentMessages()
    {
        if (_ephemeralQueue.Count > 0)
        {
            var list = new List<ChatMessage>();
            while (_ephemeralQueue.Count > 0)
            {
                list.Add(_ephemeralQueue.Dequeue());
            }
            return list;
        }

        return _messageHistory.TakeLast(25).ToList();
    }

    private static string GetDefaultJourneyStage(string role)
    {
        return role switch
        {
            "Processor" => "Browse Certified Lots & Contracts",
            "FpoManager" => "Mandi Procurement & Lot Grading",
            "QualityInspector" => "Moisture & Impurity Assaying",
            "WarehouseManager" => "Warehouse Silo Allocation & Bagging",
            "LogisticsCoordinator" => "Fleet Transit & OTP Handshake",
            "Accountant" => "Farmer DBT Payout Clearance",
            "Driver" => "Transit & Delivery OTP Verification",
            _ => "Procurement Center Arrival & QC Assaying"
        };
    }
}
