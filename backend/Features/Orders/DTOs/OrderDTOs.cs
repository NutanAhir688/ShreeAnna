namespace backend.Features.Orders.DTOs;

public record CreateOrderItemRequest(
    Guid? ProductId,
    string ProductTitle,
    string? Category,
    string? ProducerName,
    string? ImageUrl,
    decimal Price,
    int Quantity
);

public record CreateOrderRequest(
    string CustomerName,
    string CustomerEmail,
    string CustomerPhone,
    string ShippingAddress,
    string? City,
    string? State,
    string? Pincode,
    string? PaymentMethod,
    List<CreateOrderItemRequest> Items,
    decimal? CustomerLatitude = null,
    decimal? CustomerLongitude = null
);

public record ConfirmDeliveryOtpRequest(
    string Otp
);

public record AssignOrderDriverRequest(
    Guid? DriverId
);

public record OrderItemResponse(
    Guid Id,
    Guid? ProductId,
    string ProductTitle,
    string Category,
    string ProducerName,
    string? ImageUrl,
    decimal UnitPrice,
    int Quantity,
    decimal TotalPrice
);

public record OrderResponse(
    Guid Id,
    string OrderNumber,
    string CustomerName,
    string CustomerEmail,
    string CustomerPhone,
    string ShippingAddress,
    string City,
    string State,
    string Pincode,
    string PaymentMethod,
    string PaymentStatus,
    decimal Subtotal,
    decimal DeliveryFee,
    decimal TotalAmount,
    string Status,
    string DeliveryOtp,
    Guid? AssignedDriverId,
    string? DriverName,
    string? DriverPhone,
    string? VehicleNumber,
    DateTime CreatedAt,
    DateTime? DeliveredAt,
    List<OrderItemResponse> Items,
    decimal? CustomerLatitude = null,
    decimal? CustomerLongitude = null,
    decimal? DriverLatitude = null,
    decimal? DriverLongitude = null
);
