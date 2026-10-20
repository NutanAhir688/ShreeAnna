using Akka.Actor;

namespace backend.Features.Support.Actors;

/// <summary>
/// Root supervisor actor that manages and routes messages to individual UserSessionActors.
/// Uses OneForOneStrategy to isolate failures of any single user session.
/// </summary>
public class ChatManagerActor : ReceiveActor
{
    private readonly Dictionary<string, IActorRef> _sessions = new();

    public ChatManagerActor()
    {
        Receive<ConnectSession>(msg =>
        {
            var sessionActor = GetOrCreateSessionActor(msg.SessionId, msg.Role, msg.UserName, msg.JourneyStage);
            sessionActor.Forward(msg);
        });

        Receive<SendChatMessage>(msg =>
        {
            var sessionActor = GetOrCreateSessionActor(msg.SessionId, "Farmer", "Farmer Member", msg.JourneyStage);
            sessionActor.Forward(msg);
        });

        Receive<ReceivePendingMessages>(msg =>
        {
            if (_sessions.TryGetValue(msg.SessionId, out var actor))
            {
                actor.Forward(msg);
            }
            else
            {
                Sender.Tell(new MessagesDeliveredResponse(new List<ChatMessage>()));
            }
        });

        Receive<ResetUserSession>(msg =>
        {
            if (_sessions.TryGetValue(msg.SessionId, out var actor))
            {
                actor.Forward(msg);
            }
            else
            {
                var actorNew = GetOrCreateSessionActor(msg.SessionId, "Farmer", "User", "Procurement Center Arrival");
                actorNew.Forward(msg);
            }
        });

        Receive<Terminated>(t =>
        {
            var key = _sessions.FirstOrDefault(x => x.Value.Equals(t.ActorRef)).Key;
            if (!string.IsNullOrEmpty(key))
            {
                _sessions.Remove(key);
            }
        });
    }

    protected override SupervisorStrategy SupervisorStrategy()
    {
        return new OneForOneStrategy(
            maxNrOfRetries: 5,
            withinTimeRange: TimeSpan.FromMinutes(1),
            localOnlyDecider: ex => Directive.Restart);
    }

    private IActorRef GetOrCreateSessionActor(string sessionId, string role, string userName, string journeyStage)
    {
        if (_sessions.TryGetValue(sessionId, out var existingActor))
        {
            return existingActor;
        }

        // Akka actor names must be valid URL path components
        var safeActorName = Uri.EscapeDataString(sessionId).Replace("%", "_");
        var childActor = Context.ActorOf(
            Props.Create(() => new UserSessionActor(sessionId, role, userName, journeyStage)),
            $"session-{safeActorName}"
        );

        Context.Watch(childActor);
        _sessions[sessionId] = childActor;
        return childActor;
    }
}
