namespace backend.Features.Notifications.DTOs;

public record NotificationDto(
    Guid Id,
    Guid? FarmerId,
    string Title,
    string Message,
    string Category,
    bool IsRead,
    DateTime CreatedAt,
    string? RelatedEntityId,
    string? RelatedEntityType
);

public record CreateNotificationRequest(
    Guid? FarmerId,
    string Title,
    string Message,
    string Category,
    string? RelatedEntityId,
    string? RelatedEntityType
);
