using Akka.Actor;

namespace backend.Features.Support.Actors;

/// <summary>
/// Lightweight Akka.NET actor running per user/lot connection.
/// Provides complete fault isolation and an ephemeral in-memory message queue.
/// Supports both automated procurement journey assistance and 1-on-1 direct Farmer <-> QualityInspector chat.
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

        // Seed initial welcoming message in ephemeral queue
        var welcomeMsg = new ChatMessage(
            Id: Guid.NewGuid().ToString(),
            Sender: _sessionId.StartsWith("lot_") ? "Quality Inspector Desk" : "ShreeAnna Nodal Assistant",
            Content: _sessionId.StartsWith("lot_")
                ? $"Namaste {_userName}! This is your direct Quality Inspection chat for Lot {_sessionId.Replace("lot_", "").ToUpperInvariant()}. Ask any question regarding sample collection, moisture testing, or inspector arrival."
                : GenerateWelcomeMessage(_role, _userName, _currentJourneyStage),
            JourneyStage: _currentJourneyStage,
            Timestamp: DateTime.UtcNow,
            IsAgent: true,
            Role: _sessionId.StartsWith("lot_") ? "QualityInspector" : "System"
        );
        _ephemeralQueue.Enqueue(welcomeMsg);
        _messageHistory.Add(welcomeMsg);

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

        // If the Quality Inspector is sending a message directly to the farmer
        if (senderRole.Equals("QualityInspector", StringComparison.OrdinalIgnoreCase))
        {
            var inspectorMsg = new ChatMessage(
                Id: Guid.NewGuid().ToString(),
                Sender: senderName,
                Content: msg.Content,
                JourneyStage: _currentJourneyStage,
                Timestamp: DateTime.UtcNow,
                IsAgent: true,
                Role: "QualityInspector"
            );
            _ephemeralQueue.Enqueue(inspectorMsg);
            _messageHistory.Add(inspectorMsg);

            Sender.Tell(new MessagesDeliveredResponse(new List<ChatMessage> { inspectorMsg }));
            return;
        }

        // Direct 1-on-1 lot inspection thread from farmer
        if (_sessionId.StartsWith("lot_"))
        {
            var farmerMsg = new ChatMessage(
                Id: Guid.NewGuid().ToString(),
                Sender: senderName,
                Content: msg.Content,
                JourneyStage: _currentJourneyStage,
                Timestamp: DateTime.UtcNow,
                IsAgent: false,
                Role: "Farmer"
            );
            _ephemeralQueue.Enqueue(farmerMsg);
            _messageHistory.Add(farmerMsg);

            // Nodal inspection assistance acknowledgment
            var responseText = GenerateJourneySupportResponse(msg.Content, _currentJourneyStage, "QualityInspector");
            var ackMsg = new ChatMessage(
                Id: Guid.NewGuid().ToString(),
                Sender: "Quality Assaying Desk",
                Content: responseText,
                JourneyStage: _currentJourneyStage,
                Timestamp: DateTime.UtcNow.AddMilliseconds(200),
                IsAgent: true,
                Role: "QualityInspector"
            );
            _ephemeralQueue.Enqueue(ackMsg);
            _messageHistory.Add(ackMsg);

            Sender.Tell(new MessagesDeliveredResponse(new List<ChatMessage> { farmerMsg, ackMsg }));
            return;
        }

        // Standard procurement journey actor interaction
        var userMsg = new ChatMessage(
            Id: Guid.NewGuid().ToString(),
            Sender: senderName,
            Content: msg.Content,
            JourneyStage: _currentJourneyStage,
            Timestamp: DateTime.UtcNow,
            IsAgent: false,
            Role: senderRole
        );
        _messageHistory.Add(userMsg);

        var journeyResponse = GenerateJourneySupportResponse(msg.Content, _currentJourneyStage, senderRole);
        var agentMsg = new ChatMessage(
            Id: Guid.NewGuid().ToString(),
            Sender: "ShreeAnna Journey Specialist",
            Content: journeyResponse,
            JourneyStage: _currentJourneyStage,
            Timestamp: DateTime.UtcNow.AddMilliseconds(200),
            IsAgent: true,
            Role: "Assistant"
        );

        _ephemeralQueue.Enqueue(agentMsg);
        _messageHistory.Add(agentMsg);

        Sender.Tell(new MessagesDeliveredResponse(new List<ChatMessage> { userMsg, agentMsg }));
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
            messagesToDeliver.AddRange(_messageHistory.TakeLast(15));
        }

        Sender.Tell(new MessagesDeliveredResponse(messagesToDeliver));
    }

    private void HandleResetSession()
    {
        _ephemeralQueue.Clear();
        _messageHistory.Clear();

        var resetMsg = new ChatMessage(
            Id: Guid.NewGuid().ToString(),
            Sender: "ShreeAnna Nodal Assistant",
            Content: $"Chat session reset. Connected to Gujarat Millet Mission Support for {_role} ({_currentJourneyStage}). How can we assist your procurement journey today?",
            JourneyStage: _currentJourneyStage,
            Timestamp: DateTime.UtcNow,
            IsAgent: true,
            Role: "System"
        );

        _ephemeralQueue.Enqueue(resetMsg);
        _messageHistory.Add(resetMsg);

        Sender.Tell(new MessagesDeliveredResponse(new List<ChatMessage> { resetMsg }));
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

        return _messageHistory.TakeLast(15).ToList();
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

    private static string GenerateWelcomeMessage(string role, string name, string stage)
    {
        return role switch
        {
            "Farmer" => $"Namaste {name}! Welcome to ShreeAnna Field Support. You are currently at the '{stage}' stage. Ask any question regarding MSP rates, moisture limits, weighment, or your direct bank transfer (DBT).",
            "Processor" => $"Welcome {name}! ShreeAnna Value-Chain Support is online for your processing unit. Current stage: '{stage}'. We can assist with lot certificates, purchase requests, and store listings.",
            "FpoManager" => $"Hello {name}! FPO Nodal Support is active for '{stage}'. Ask about farmer onboarding verifications, lot grading approvals, or settlement release queues.",
            "Driver" => $"Driver Logistics Assistant online for {name}. Stage: '{stage}'. We can help verify delivery OTPs, report transit delays, or locate warehouse unloading bays.",
            "QualityInspector" => $"Welcome Quality Inspector {name}! Online at '{stage}'. View your assigned farmer lots, verify digital calibration, or message farmers directly.",
            _ => $"Welcome {name} to ShreeAnna Mission Support. Current procurement stage: '{stage}'. How can we help you right now?"
        };
    }

    private static string GenerateJourneySupportResponse(string userMessage, string stage, string role)
    {
        var lower = userMessage.ToLowerInvariant();

        if (lower.Contains("moisture") || lower.Contains("grade") || lower.Contains("qc") || lower.Contains("quality"))
        {
            return "Standard Gujarat Millet Mission QC parameters for Grade A:\n• Moisture content: Must be ≤ 12.0% for Pearl Millet (Bajra) and Finger Millet (Ragi).\n• Foreign Matter: Max 1.0%.\n• Broken / Damaged Grains: Max 2.0%.\nIf your lot qualifies, the Quality Inspector signs the digital certificate immediately.";
        }

        if (lower.Contains("dbt") || lower.Contains("payment") || lower.Contains("money") || lower.Contains("bank") || lower.Contains("settlement") || lower.Contains("payout"))
        {
            return "Farmer Direct Beneficiary Transfers (DBT) are processed within 24 hours of QC certificate signing. Funds are released through the FPO nodal account via Razorpay MockGateway directly to your registered bank account with SMS confirmation.";
        }

        if (lower.Contains("otp") || lower.Contains("delivery") || lower.Contains("driver") || lower.Contains("handover"))
        {
            return "For delivery verification: The receiving party must share their 4-digit OTP shown on the order / dispatch card. Once entered by the driver, the shipment instantly updates to DELIVERED and driver availability is restored.";
        }

        if (lower.Contains("price") || lower.Contains("rate") || lower.Contains("msp") || lower.Contains("cost"))
        {
            return "Current Gujarat State MSP & Benchmark Procurement Rates (FY 2026-27):\n• Pearl Millet (Bajra): ₹2,500 / Quintal (₹25/kg minimum benchmark; marketplace average ₹44 - ₹180/kg processed).\n• Finger Millet (Ragi): ₹3,846 / Quintal.\n• Foxtail Millet: ₹3,100 / Quintal.";
        }

        if (lower.Contains("warehouse") || lower.Contains("storage") || lower.Contains("silo") || lower.Contains("bag"))
        {
            return "Our primary regional storage hubs are Anand (WH-GUJ-008, 10,000 MT) and Dahod (WH-GUJ-001, 5,000 MT). Both facilities provide aerated, moisture-controlled grain preservation. Ensure your lot has an allocated lot number tag before unloading.";
        }

        if (lower.Contains("arrive") || lower.Contains("time") || lower.Contains("reach") || lower.Contains("visit") || lower.Contains("when"))
        {
            return "Your assigned Quality Inspector has scheduled your visit. Inspection is in progress (ETA within scheduled slot). Please ensure samples from bottom, middle, and top of bags are easily accessible.";
        }

        if (lower.Contains("contact") || lower.Contains("phone") || lower.Contains("officer") || lower.Contains("nodal"))
        {
            return "You can reach the Dahod District Agricultural Officer (Dr. Arvind Rathod) at +91 94270 11234, or our state toll-free helpline at 1800-233-0255 (Mon-Sat, 8 AM - 8 PM).";
        }

        return $"Regarding '{stage}' ({role}): Your message has been logged with the assigned Quality Inspector and Nodal Desk. Please keep your grain bags dry and ready for digital probe testing.";
    }
}
