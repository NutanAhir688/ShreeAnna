namespace backend.Features.Notifications.Services;

using backend.Features.Notifications.DTOs;

public interface INotificationService
{
    Task<List<NotificationDto>> GetFarmerNotificationsAsync(Guid farmerId);
    Task<bool> MarkAsReadAsync(Guid notificationId, Guid farmerId);
    Task<bool> MarkAllAsReadAsync(Guid farmerId);
    Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request);
}
