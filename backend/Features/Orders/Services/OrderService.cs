using backend.Data;
using backend.Features.Orders.DTOs;
using backend.Features.Orders.Entities;
using backend.Features.Logistics.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Orders.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request)
    {
        if (request.Items == null || request.Items.Count == 0)
        {
            throw new ArgumentException("Order must contain at least one item.");
        }

        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
        var deliveryOtp = Random.Shared.Next(1000, 9999).ToString();

        decimal subtotal = request.Items.Sum(item => item.Price * item.Quantity);
        decimal deliveryFee = 40.00m;
        decimal totalAmount = subtotal + deliveryFee;

        var order = new Order
        {
            OrderNumber = orderNumber,
            CustomerName = request.CustomerName,
            CustomerEmail = request.CustomerEmail,
            CustomerPhone = request.CustomerPhone,
            ShippingAddress = request.ShippingAddress,
            City = string.IsNullOrWhiteSpace(request.City) ? "Dahod" : request.City,
            State = string.IsNullOrWhiteSpace(request.State) ? "Gujarat" : request.State,
            Pincode = string.IsNullOrWhiteSpace(request.Pincode) ? "389151" : request.Pincode,
            PaymentMethod = string.IsNullOrWhiteSpace(request.PaymentMethod) ? "UPI" : request.PaymentMethod,
            PaymentStatus = "PAID",
            Subtotal = subtotal,
            DeliveryFee = deliveryFee,
            TotalAmount = totalAmount,
            Status = "CONFIRMED",
            DeliveryOtp = deliveryOtp,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var item in request.Items)
        {
            order.Items.Add(new OrderItem
            {
                OrderId = order.Id,
                ProductId = item.ProductId,
                ProductTitle = item.ProductTitle,
                Category = item.Category ?? "Flours & Grains",
                ProducerName = item.ProducerName ?? "Millet Shakti SHG",
                ImageUrl = item.ImageUrl,
                UnitPrice = item.Price,
                Quantity = item.Quantity,
                TotalPrice = item.Price * item.Quantity
            });
        }

        // Auto-assign any free driver
        var freeDriver = await _context.Drivers.FirstOrDefaultAsync(d => d.Status == "AVAILABLE");
        if (freeDriver == null)
        {
            // Seed a driver if none exists so auto-assignment always succeeds
            freeDriver = new Driver
            {
                DriverCode = $"DRV-{Random.Shared.Next(100, 999)}",
                Name = "Ramesh Verma",
                Phone = "+91 98765 43210",
                LicenseNumber = "GJ20-2024-009281",
                VehicleNumber = "GJ-20-AB-4021",
                VehicleCapacityKg = 7000,
                Status = "AVAILABLE"
            };
            _context.Drivers.Add(freeDriver);
            await _context.SaveChangesAsync();
        }

        order.AssignedDriverId = freeDriver.Id;
        order.DriverName = freeDriver.Name;
        order.DriverPhone = freeDriver.Phone;
        order.VehicleNumber = freeDriver.VehicleNumber;
        order.Status = "ASSIGNED_TO_DRIVER";

        freeDriver.Status = "ON_JOURNEY";

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return MapToResponse(order);
    }

    public async Task<List<OrderResponse>> GetAllOrdersAsync(string? customerEmail = null)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(customerEmail))
        {
            query = query.Where(o => o.CustomerEmail.ToLower() == customerEmail.ToLower());
        }

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(MapToResponse).ToList();
    }

    public async Task<OrderResponse?> GetOrderByIdAsync(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        return order == null ? null : MapToResponse(order);
    }

    public async Task<OrderResponse> ConfirmDeliveryWithOtpAsync(Guid orderId, string otp)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
        {
            throw new KeyNotFoundException($"Order with ID {orderId} was not found.");
        }

        if (order.Status == "DELIVERED")
        {
            return MapToResponse(order);
        }

        if (order.DeliveryOtp != otp.Trim())
        {
            throw new InvalidOperationException("Invalid delivery OTP. Please verify the 4-digit code provided by the customer.");
        }

        order.Status = "DELIVERED";
        order.DeliveredAt = DateTime.UtcNow;

        if (order.AssignedDriverId.HasValue)
        {
            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Id == order.AssignedDriverId.Value);
            if (driver != null)
            {
                driver.Status = "AVAILABLE";
            }
        }

        await _context.SaveChangesAsync();
        return MapToResponse(order);
    }

    public async Task<OrderResponse> AssignDriverAsync(Guid orderId, Guid? driverId = null)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
        {
            throw new KeyNotFoundException($"Order with ID {orderId} was not found.");
        }

        Driver? driver = null;
        if (driverId.HasValue)
        {
            driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Id == driverId.Value);
        }
        else
        {
            driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Status == "AVAILABLE");
        }

        if (driver != null)
        {
            order.AssignedDriverId = driver.Id;
            order.DriverName = driver.Name;
            order.DriverPhone = driver.Phone;
            order.VehicleNumber = driver.VehicleNumber;
            order.Status = "ASSIGNED_TO_DRIVER";
            driver.Status = "ON_JOURNEY";
            await _context.SaveChangesAsync();
        }

        return MapToResponse(order);
    }

    private static OrderResponse MapToResponse(Order order)
    {
        return new OrderResponse(
            order.Id,
            order.OrderNumber,
            order.CustomerName,
            order.CustomerEmail,
            order.CustomerPhone,
            order.ShippingAddress,
            order.City,
            order.State,
            order.Pincode,
            order.PaymentMethod,
            order.PaymentStatus,
            order.Subtotal,
            order.DeliveryFee,
            order.TotalAmount,
            order.Status,
            order.DeliveryOtp,
            order.AssignedDriverId,
            order.DriverName,
            order.DriverPhone,
            order.VehicleNumber,
            order.CreatedAt,
            order.DeliveredAt,
            order.Items.Select(i => new OrderItemResponse(
                i.Id,
                i.ProductId,
                i.ProductTitle,
                i.Category,
                i.ProducerName,
                i.ImageUrl,
                i.UnitPrice,
                i.Quantity,
                i.TotalPrice
            )).ToList()
        );
    }
}
