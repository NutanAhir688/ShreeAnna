namespace backend.Features.Notifications.Services;

using backend.Data;
using backend.Features.Notifications.DTOs;
using backend.Features.Notifications.Entities;
using Microsoft.EntityFrameworkCore;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;

    public NotificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<NotificationDto>> GetFarmerNotificationsAsync(Guid farmerId)
    {
        // Sync notifications with real farmer activities
        await SyncFarmerNotificationsAsync(farmerId);

        var notifications = await _context.Notifications
            .Where(n => n.FarmerId == farmerId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        // In-memory deduplication: group by normalized key and take the latest one
        // This ensures historical duplicate entries in DB don't spam the mobile app UI
        var distinctNotifs = notifications
            .GroupBy(n => NormalizeKey(n.RelatedEntityId, n.Category, n.Title))
            .Select(g => g.OrderByDescending(x => x.CreatedAt).First())
            .OrderByDescending(n => n.CreatedAt)
            .ToList();

        return distinctNotifs.Select(n => new NotificationDto(
            n.Id,
            n.FarmerId,
            n.Title,
            n.Message,
            n.Category,
            n.IsRead,
            n.CreatedAt,
            n.RelatedEntityId,
            n.RelatedEntityType
        )).ToList();
    }

    private static string NormalizeKey(string? relatedEntityId, string? category, string? title)
    {
        var cleanTitle = title ?? "";
        if (cleanTitle.StartsWith("Inspection in Progress", StringComparison.OrdinalIgnoreCase))
            cleanTitle = "Inspection in Progress";
        else if (cleanTitle.StartsWith("Quality Assay Certified", StringComparison.OrdinalIgnoreCase))
            cleanTitle = "Quality Assay Certified";
        else if (cleanTitle.Contains("Submitted", StringComparison.OrdinalIgnoreCase))
            cleanTitle = "Lot Submitted";
        else if (cleanTitle.StartsWith("Procurement Agreement Ready", StringComparison.OrdinalIgnoreCase))
            cleanTitle = "Procurement Agreement Ready";
        else if (cleanTitle.StartsWith("Driver En Route", StringComparison.OrdinalIgnoreCase))
            cleanTitle = "Driver En Route";
        else if (cleanTitle.StartsWith("Warehouse Delivery Confirmed", StringComparison.OrdinalIgnoreCase))
            cleanTitle = "Warehouse Delivery Confirmed";
        else if (cleanTitle.StartsWith("DBT Payment Disbursed", StringComparison.OrdinalIgnoreCase))
            cleanTitle = "DBT Payment Disbursed";

        return $"{relatedEntityId}_{category}_{cleanTitle}";
    }

    public async Task<bool> MarkAsReadAsync(Guid notificationId, Guid farmerId)
    {
        var notif = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.FarmerId == farmerId);

        if (notif == null)
        {
            return false;
        }

        notif.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(Guid farmerId)
    {
        var unread = await _context.Notifications
            .Where(n => n.FarmerId == farmerId && !n.IsRead)
            .ToListAsync();

        if (unread.Count == 0)
        {
            return true;
        }

        foreach (var n in unread)
        {
            n.IsRead = true;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request)
    {
        var notif = new Notification
        {
            Id = Guid.NewGuid(),
            FarmerId = request.FarmerId,
            Title = request.Title,
            Message = request.Message,
            Category = request.Category,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            RelatedEntityId = request.RelatedEntityId,
            RelatedEntityType = request.RelatedEntityType
        };

        await _context.Notifications.AddAsync(notif);
        await _context.SaveChangesAsync();

        return new NotificationDto(
            notif.Id,
            notif.FarmerId,
            notif.Title,
            notif.Message,
            notif.Category,
            notif.IsRead,
            notif.CreatedAt,
            notif.RelatedEntityId,
            notif.RelatedEntityType
        );
    }

    private async Task SyncFarmerNotificationsAsync(Guid farmerId)
    {
        var existingNotifs = await _context.Notifications
            .Where(n => n.FarmerId == farmerId)
            .ToListAsync();

        var existingKeys = existingNotifs
            .Select(n => NormalizeKey(n.RelatedEntityId, n.Category, n.Title))
            .ToHashSet();

        var lots = await _context.ProcurementLots
            .Include(l => l.FarmCrop)
            .Include(l => l.Farm)
            .Where(l => l.FarmerId == farmerId)
            .ToListAsync();

        var lotIds = lots.Select(l => l.Id.ToString()).ToList();
        var dispatches = await _context.Dispatches
            .Where(d => lotIds.Contains(d.LotId))
            .ToListAsync();

        var newNotifs = new List<Notification>();

        foreach (var lot in lots)
        {
            var cropName = lot.FarmCrop?.CropName ?? "Millet";
            var farmName = lot.Farm?.FarmName ?? "Registered Farm";
            var lotIdStr = lot.Id.ToString();

            // 1. Lot Submission Notification
            var subTitle = $"Lot #{lot.LotNumber} Submitted";
            var subKey = NormalizeKey(lotIdStr, "Procurement", subTitle);
            if (!existingKeys.Contains(subKey))
            {
                newNotifs.Add(new Notification
                {
                    Id = Guid.NewGuid(),
                    FarmerId = farmerId,
                    Title = subTitle,
                    Message = $"Your harvest of {lot.EstimatedQuantityKg:F0} kg {cropName} from {farmName} is registered and queued for QA inspection.",
                    Category = "Procurement",
                    IsRead = false,
                    CreatedAt = lot.SubmissionDate,
                    RelatedEntityId = lot.Id.ToString(),
                    RelatedEntityType = "Lot"
                });
                existingKeys.Add(subKey);
            }

            // 2. Inspection Status
            if (lot.Status.ToUpper() == "QUALITY_INSPECTION" || lot.Status.ToUpper() == "INSPECTION IN PROGRESS")
            {
                var inspTitle = $"Inspection in Progress: Lot #{lot.LotNumber}";
                var inspKey = NormalizeKey(lotIdStr, "Inspection", inspTitle);
                if (!existingKeys.Contains(inspKey))
                {
                    newNotifs.Add(new Notification
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = farmerId,
                        Title = inspTitle,
                        Message = $"Quality inspection scheduled with {(string.IsNullOrWhiteSpace(lot.AssignedInspectorName) ? "FPO Inspector" : lot.AssignedInspectorName)}. Please be available at {farmName}.",
                        Category = "Inspection",
                        IsRead = false,
                        CreatedAt = lot.ScheduledInspectionDate ?? lot.SubmissionDate.AddHours(2),
                        RelatedEntityId = lot.Id.ToString(),
                        RelatedEntityType = "Lot"
                    });
                    existingKeys.Add(inspKey);
                }
            }

            // 3. Quality Certified
            if (lot.Status.ToUpper() == "QUALITY_CERTIFIED" || lot.Status.ToUpper() == "CERTIFIED" || lot.Status.ToUpper() == "AGREEMENT_PENDING" || lot.Status.ToUpper() == "DISPATCHED" || lot.Status.ToUpper() == "DELIVERED" || lot.Status.ToUpper() == "STORED")
            {
                var certTitle = $"Quality Assay Certified: Lot #{lot.LotNumber}";
                var certKey = NormalizeKey(lotIdStr, "Inspection", certTitle);
                if (!existingKeys.Contains(certKey))
                {
                    newNotifs.Add(new Notification
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = farmerId,
                        Title = certTitle,
                        Message = $"Quality inspection passed for {lot.EstimatedQuantityKg:F0} kg {cropName}. Grade: Grade A. Quality certificate generated.",
                        Category = "Inspection",
                        IsRead = false,
                        CreatedAt = lot.SubmissionDate.AddHours(4),
                        RelatedEntityId = lot.Id.ToString(),
                        RelatedEntityType = "Lot"
                    });
                    existingKeys.Add(certKey);
                }
            }

            // 4. Procurement Agreement
            if (lot.Status.ToUpper() == "AGREEMENT_PENDING")
            {
                var agrTitle = "Procurement Agreement Ready";
                var agrKey = NormalizeKey(lotIdStr, "Procurement", agrTitle);
                if (!existingKeys.Contains(agrKey))
                {
                    newNotifs.Add(new Notification
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = farmerId,
                        Title = agrTitle,
                        Message = $"FPO generated MSP procurement agreement for Lot #{lot.LotNumber} ({lot.AgreedQuantityKg ?? lot.EstimatedQuantityKg:F0} kg at ₹{lot.OfferedPricePerKg ?? 2350}/qtl). Review & accept.",
                        Category = "Procurement",
                        IsRead = false,
                        CreatedAt = lot.SubmissionDate.AddHours(6),
                        RelatedEntityId = lot.Id.ToString(),
                        RelatedEntityType = "Lot"
                    });
                    existingKeys.Add(agrKey);
                }
            }

            // 5. Logistics / Dispatches
            var lotDispatches = dispatches.Where(d => d.LotId == lotIdStr).ToList();
            foreach (var d in lotDispatches)
            {
                var dispTitle = "Driver En Route to Farm";
                var dispKey = NormalizeKey(d.Id.ToString(), "Logistics", dispTitle);
                if (!existingKeys.Contains(dispKey))
                {
                    newNotifs.Add(new Notification
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = farmerId,
                        Title = dispTitle,
                        Message = $"Driver {d.DriverName} ({d.VehicleNumber}) is in transit to {farmName}. Verification code: {d.VerificationCode}.",
                        Category = "Logistics",
                        IsRead = false,
                        CreatedAt = d.CreatedAt,
                        RelatedEntityId = d.Id.ToString(),
                        RelatedEntityType = "Dispatch"
                    });
                    existingKeys.Add(dispKey);
                }

                if (d.Status.ToUpper() == "COMPLETED" || d.Status.ToUpper() == "DELIVERED")
                {
                    var whTitle = "Warehouse Delivery Confirmed";
                    var whKey = NormalizeKey(d.Id.ToString(), "Logistics", whTitle);
                    if (!existingKeys.Contains(whKey))
                    {
                        newNotifs.Add(new Notification
                        {
                            Id = Guid.NewGuid(),
                            FarmerId = farmerId,
                            Title = whTitle,
                            Message = $"Shipment #{d.DispatchCode} for Lot #{lot.LotNumber} was delivered and verified at destination warehouse.",
                            Category = "Logistics",
                            IsRead = false,
                            CreatedAt = d.DeliveredDate ?? d.CreatedAt,
                            RelatedEntityId = d.Id.ToString(),
                            RelatedEntityType = "Dispatch"
                        });
                        existingKeys.Add(whKey);
                    }
                }
            }

            // 6. Payment
            if (lot.Status.ToUpper() == "STORED" || lot.Status.ToUpper() == "PAYMENT_COMPLETED")
            {
                var payTitle = "DBT Payment Disbursed";
                var payKey = NormalizeKey(lotIdStr, "Payment", payTitle);
                if (!existingKeys.Contains(payKey))
                {
                    var totalAmount = (lot.AgreedQuantityKg ?? lot.EstimatedQuantityKg) * (lot.OfferedPricePerKg ?? 25.50m);
                    newNotifs.Add(new Notification
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = farmerId,
                        Title = payTitle,
                        Message = $"Payment of ₹{totalAmount:N0} has been processed via Direct Benefit Transfer for Lot #{lot.LotNumber}.",
                        Category = "Payment",
                        IsRead = false,
                        CreatedAt = lot.UpdatedAt,
                        RelatedEntityId = lot.Id.ToString(),
                        RelatedEntityType = "Payment"
                    });
                    existingKeys.Add(payKey);
                }
            }
        }

        if (newNotifs.Count > 0)
        {
            await _context.Notifications.AddRangeAsync(newNotifs);
            await _context.SaveChangesAsync();
        }
    }
}
