using Akka.Actor;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Features.Support.Actors;
using backend.Features.Support.DTOs;

namespace backend.Features.Support.Services;

public class SupportChatService : ISupportChatService
{
    private readonly IActorRef _chatManager;
    private readonly IServiceScopeFactory _scopeFactory;

    public SupportChatService(IActorRef chatManager, IServiceScopeFactory scopeFactory)
    {
        _chatManager = chatManager;
        _scopeFactory = scopeFactory;
    }

    public async Task<List<ChatMessageDto>> ConnectSessionAsync(ConnectSessionRequest request, CancellationToken ct = default)
    {
        var sessionId = string.IsNullOrWhiteSpace(request.SessionId) ? Guid.NewGuid().ToString("N") : request.SessionId;
        var msg = new ConnectSession(sessionId, request.Role, request.UserName, request.JourneyStage);

        var response = await _chatManager.Ask<MessagesDeliveredResponse>(msg, TimeSpan.FromSeconds(5), ct);
        return MapMessages(response.Messages);
    }

    public async Task<List<ChatMessageDto>> SendMessageAsync(SendMessageRequest request, CancellationToken ct = default)
    {
        var sessionId = string.IsNullOrWhiteSpace(request.SessionId) ? Guid.NewGuid().ToString("N") : request.SessionId;
        var msg = new SendChatMessage(sessionId, request.Sender, request.Content, request.JourneyStage, request.Role);

        var response = await _chatManager.Ask<MessagesDeliveredResponse>(msg, TimeSpan.FromSeconds(5), ct);
        return MapMessages(response.Messages);
    }

    public async Task<List<ChatMessageDto>> GetPendingMessagesAsync(string sessionId, CancellationToken ct = default)
    {
        var msg = new ReceivePendingMessages(sessionId);
        var response = await _chatManager.Ask<MessagesDeliveredResponse>(msg, TimeSpan.FromSeconds(5), ct);
        return MapMessages(response.Messages);
    }

    public async Task<List<ChatMessageDto>> GetSessionHistoryAsync(string sessionId, CancellationToken ct = default)
    {
        var msg = new GetSessionHistory(sessionId);
        var response = await _chatManager.Ask<MessagesDeliveredResponse>(msg, TimeSpan.FromSeconds(5), ct);
        return MapMessages(response.Messages);
    }

    public async Task<List<ChatMessageDto>> ResetSessionAsync(string sessionId, CancellationToken ct = default)
    {
        var msg = new ResetUserSession(sessionId);
        var response = await _chatManager.Ask<MessagesDeliveredResponse>(msg, TimeSpan.FromSeconds(5), ct);
        return MapMessages(response.Messages);
    }

    public async Task<List<InspectorConversationDto>> GetInspectorConversationsAsync(string? inspectorName = null, CancellationToken ct = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var query = db.ProcurementLots
            .Include(l => l.Farmer)
            .Include(l => l.FarmCrop)
            .AsNoTracking();

        var lots = await query
            .OrderByDescending(l => l.CreatedAt)
            .Take(30)
            .ToListAsync(ct);

        var conversations = new List<InspectorConversationDto>();
        foreach (var lot in lots)
        {
            var sessionId = $"lot_{lot.Id}";
            string lastMessage = "Inspection in progress • Click to open 1-to-1 chat";
            DateTime lastTime = lot.ScheduledInspectionDate ?? lot.CreatedAt;

            try
            {
                var history = await _chatManager.Ask<MessagesDeliveredResponse>(new GetSessionHistory(sessionId), TimeSpan.FromMilliseconds(500), ct);
                if (history?.Messages != null && history.Messages.Count > 0)
                {
                    var latest = history.Messages.Last();
                    lastMessage = $"{latest.Sender}: {latest.Content}";
                    lastTime = latest.Timestamp;
                }
            }
            catch
            {
                // Non-blocking fallback
            }

            conversations.Add(new InspectorConversationDto
            {
                SessionId = sessionId,
                LotId = lot.Id,
                LotNumber = string.IsNullOrWhiteSpace(lot.LotNumber) ? $"LOT-{lot.Id.ToString().Substring(0, 6).ToUpperInvariant()}" : lot.LotNumber,
                FarmerId = lot.FarmerId,
                FarmerName = lot.Farmer != null ? lot.Farmer.FullName : "Farmer Member",
                FarmerPhone = lot.Farmer != null && !string.IsNullOrWhiteSpace(lot.Farmer.Phone) ? lot.Farmer.Phone : "+91 9876543210",
                Village = lot.Farmer != null && !string.IsNullOrWhiteSpace(lot.Farmer.Village) ? lot.Farmer.Village : "Limkheda Village",
                Taluka = lot.Farmer != null && !string.IsNullOrWhiteSpace(lot.Farmer.Taluka) ? lot.Farmer.Taluka : "Limkheda",
                District = lot.Farmer != null && !string.IsNullOrWhiteSpace(lot.Farmer.District) ? lot.Farmer.District : "Dahod",
                CropName = lot.FarmCrop != null && !string.IsNullOrWhiteSpace(lot.FarmCrop.CropName) ? lot.FarmCrop.CropName : "Pearl Millet (Bajra)",
                EstimatedQuantityKg = lot.EstimatedQuantityKg,
                Status = lot.Status,
                InspectionTrackingStatus = lot.InspectionTrackingStatus ?? "ASSIGNED",
                ScheduledInspectionDate = lot.ScheduledInspectionDate,
                AssignedInspectorName = lot.AssignedInspectorName ?? "Ananya Roy (Quality Inspector)",
                LastMessage = lastMessage,
                LastMessageTimestamp = lastTime,
                UnreadCount = 0
            });
        }

        return conversations;
    }

    public List<JourneyStageDto> GetJourneyStagesForRole(string role)
    {
        var normalizedRole = string.IsNullOrWhiteSpace(role) ? "Farmer" : role;

        return normalizedRole switch
        {
            "Processor" => new List<JourneyStageDto>
            {
                new()
                {
                    Id = "p1",
                    Name = "Browse Certified Lots & Lab Reports",
                    Role = "Processor",
                    Description = "Inspect assayed grain lots with verified moisture, impurity, and organic certificates.",
                    SuggestedPrompts = new()
                    {
                        "Where can I view NIR moisture scan certificates?",
                        "What is the average lot size available in Dahod silo?",
                        "Can I filter lots by organic certification?"
                    }
                },
                new()
                {
                    Id = "p2",
                    Name = "Purchase Order & Escrow Deposit",
                    Role = "Processor",
                    Description = "Commit purchase funds to secure state procurement lots via escrow guarantee.",
                    SuggestedPrompts = new()
                    {
                        "How does the escrow payment release work?",
                        "What are the processing charges for Anand hub?",
                        "Can I lock partial volume from a 20 MT lot?"
                    }
                },
                new()
                {
                    Id = "p3",
                    Name = "Warehouse Silo Release & Transit Handshake",
                    Role = "Processor",
                    Description = "Authorize fleet pickup and monitor driver dispatch with live tracking.",
                    SuggestedPrompts = new()
                    {
                        "How do I authorize driver bay entry at Dahod?",
                        "What is the required truck turnaround window?",
                        "How to track transit GPS and temperature logs?"
                    }
                },
                new()
                {
                    Id = "p4",
                    Name = "Value-Addition & FMCG Store Listing",
                    Role = "Processor",
                    Description = "Convert whole millets into flour, cookies, flakes and list on the consumer portal.",
                    SuggestedPrompts = new()
                    {
                        "How do I publish value-added millet flour to store?",
                        "What FSSAI packaging norms apply for consumer boxes?",
                        "How do I link finished products to the raw grain lot batch?"
                    }
                }
            },
            "FpoManager" => new List<JourneyStageDto>
            {
                new()
                {
                    Id = "fpo1",
                    Name = "Farmer Onboarding & Acreage KYC",
                    Role = "FpoManager",
                    Description = "Verify smallholder land holdings and seed distribution logs.",
                    SuggestedPrompts = new()
                    {
                        "How do I verify farmer Aadhaar and 7/12 land records?",
                        "What is the millet sowing registration deadline?",
                        "How to export registered farmer rosters?"
                    }
                },
                new()
                {
                    Id = "fpo2",
                    Name = "Mandi Procurement & Lot Grading",
                    Role = "FpoManager",
                    Description = "Oversee collection center arrivals and preliminary sorting.",
                    SuggestedPrompts = new()
                    {
                        "What is the daily intake capacity for Dahod center?",
                        "How do I mark rejected lots for re-cleaning?",
                        "Can I assign multiple assayers to one gate?"
                    }
                },
                new()
                {
                    Id = "fpo3",
                    Name = "Direct Benefit Transfer (DBT) Clearance",
                    Role = "FpoManager",
                    Description = "Release authenticated bank payouts to farmers upon certified intake.",
                    SuggestedPrompts = new()
                    {
                        "How do I authorize batch DBT payouts?",
                        "What causes bank account verification rejections?",
                        "Where can I download the district payout ledger?"
                    }
                }
            },
            "Driver" => new List<JourneyStageDto>
            {
                new()
                {
                    Id = "d1",
                    Name = "Dispatch Assignment & Vehicle Inspection",
                    Role = "Driver",
                    Description = "Receive vehicle route, payload tonnage, and origin collection point.",
                    SuggestedPrompts = new()
                    {
                        "Where is my pickup warehouse bay located?",
                        "What is the maximum gross vehicle weight allowed?",
                        "How do I report mechanical delays before loading?"
                    }
                },
                new()
                {
                    Id = "d2",
                    Name = "Transit & Delivery OTP Verification",
                    Role = "Driver",
                    Description = "Safely transport cargo and authenticate handover with receiving party OTP.",
                    SuggestedPrompts = new()
                    {
                        "Where do I enter the receiver 4-digit OTP?",
                        "What should I do if receiver is not available at unloading bay?",
                        "How does successful delivery update my trip allowance?"
                    }
                }
            },
            "QualityInspector" => new List<JourneyStageDto>
            {
                new()
                {
                    Id = "qi1",
                    Name = "Moisture & Impurity Assaying",
                    Role = "QualityInspector",
                    Description = "Extract grain core samples and calibrate digital grain analysis meters.",
                    SuggestedPrompts = new()
                    {
                        "What is the max allowed moisture percentage for Bajra?",
                        "How many core samples are required per 50-bag lot?",
                        "How to record foreign matter and weeviled grain percentage?"
                    }
                },
                new()
                {
                    Id = "qi2",
                    Name = "Digital Certificate Signing",
                    Role = "QualityInspector",
                    Description = "Digitally sign and attach QC Grade A/B certificates to the lot.",
                    SuggestedPrompts = new()
                    {
                        "How do I issue a digital QC certificate?",
                        "What is the re-testing protocol if a farmer appeals?",
                        "Can I override moisture values after final signing?"
                    }
                }
            },
            "WarehouseManager" => new List<JourneyStageDto>
            {
                new()
                {
                    Id = "wm1",
                    Name = "Incoming Truck Bay Allocation",
                    Role = "WarehouseManager",
                    Description = "Direct trucks to designated unloading bays and weighbridge balance.",
                    SuggestedPrompts = new()
                    {
                        "Which bay is configured for Ragi bulk discharge?",
                        "How to record weighbridge tare weight discrepancy?",
                        "What are active silo temperature levels?"
                    }
                },
                new()
                {
                    Id = "wm2",
                    Name = "Stack Management & Outward Dispatch",
                    Role = "WarehouseManager",
                    Description = "Maintain fumigation records and release bagged stock for processing.",
                    SuggestedPrompts = new()
                    {
                        "When is the next phosphine fumigation cycle scheduled?",
                        "How to generate warehouse outward gate pass?",
                        "How do I report damaged grain bags during handling?"
                    }
                }
            },
            "Accountant" => new List<JourneyStageDto>
            {
                new()
                {
                    Id = "acc1",
                    Name = "Farmer DBT Payout Clearance",
                    Role = "Accountant",
                    Description = "Audit weighbridge invoices and approve direct bank transfers to growers.",
                    SuggestedPrompts = new()
                    {
                        "How do I batch approve farmer DBT disbursements?",
                        "What is the state subsidy reimbursement timeline?",
                        "Where can I reconcile Razorpay MockGateway logs?"
                    }
                }
            },
            _ => new List<JourneyStageDto>
            {
                new()
                {
                    Id = "f1",
                    Name = "Crop Advisory & Harvest Preparation",
                    Role = "Farmer",
                    Description = "Field guidance on optimal harvest maturity, sun-drying, and initial cleaning.",
                    SuggestedPrompts = new()
                    {
                        "What is the ideal moisture level before taking Bajra to mandi?",
                        "How should I clean foreign seeds from my Pearl Millet harvest?",
                        "Which Mandi center in Dahod is currently procuring Ragi?"
                    }
                },
                new()
                {
                    Id = "f2",
                    Name = "Procurement Center Arrival & Gate Pass",
                    Role = "Farmer",
                    Description = "Token generation, vehicle entry check, and queue allocation at the mandi.",
                    SuggestedPrompts = new()
                    {
                        "What documents do I need at the Mandi entry gate?",
                        "What are the operating hours of Dahod procurement center?",
                        "How do I check my turn number in the vehicle queue?"
                    }
                },
                new()
                {
                    Id = "f3",
                    Name = "Weighbridge & QC Moisture Assaying",
                    Role = "Farmer",
                    Description = "Accurate electronic weighment and digital moisture testing of grain lots.",
                    SuggestedPrompts = new()
                    {
                        "What is the maximum allowed moisture percentage for Grade A MSP?",
                        "Can I request a re-test if moisture tests at 12.3%?",
                        "Who conducts the sampling and where is the certificate issued?"
                    }
                },
                new()
                {
                    Id = "f4",
                    Name = "Sale Deed & Electronic Weight Slip",
                    Role = "Farmer",
                    Description = "Formal purchase contract generation with exact net weight and MSP rate calculation.",
                    SuggestedPrompts = new()
                    {
                        "What is the current Gujarat MSP rate for Pearl Millet (Bajra)?",
                        "How is tare weight deducted for gunny bags?",
                        "Will I receive an SMS receipt of my sale deed?"
                    }
                },
                new()
                {
                    Id = "f5",
                    Name = "Direct Benefit Transfer (DBT) Payout",
                    Role = "Farmer",
                    Description = "Direct bank account transfer within 24-48 hours of lot verification.",
                    SuggestedPrompts = new()
                    {
                        "When will the payment reflect in my bank account?",
                        "What if my registered bank IFSC or Aadhaar link has an issue?",
                        "How do I verify the DBT transaction reference number?"
                    }
                }
            }
        };
    }

    private static List<ChatMessageDto> MapMessages(IEnumerable<ChatMessage> messages)
    {
        return messages.Select(m => new ChatMessageDto
        {
            Id = m.Id,
            Sender = m.Sender,
            Content = m.Content,
            JourneyStage = m.JourneyStage,
            Timestamp = m.Timestamp,
            IsAgent = m.IsAgent,
            Role = m.Role
        }).ToList();
    }
}
