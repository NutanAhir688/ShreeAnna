using backend.Features.Orders.DTOs;

namespace backend.Features.Orders.Services;

public interface IOrderService
{
    Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request);
    Task<List<OrderResponse>> GetAllOrdersAsync(string? customerEmail = null);
    Task<OrderResponse?> GetOrderByIdAsync(Guid id);
    Task<OrderResponse> ConfirmDeliveryWithOtpAsync(Guid orderId, string otp);
    Task<OrderResponse> AssignDriverAsync(Guid orderId, Guid? driverId = null);
}
