using backend.Features.Orders.DTOs;
using backend.Features.Orders.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Orders.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<OrderResponse>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        try
        {
            var order = await _orderService.CreateOrderAsync(request);
            return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<OrderResponse>>> GetAllOrders([FromQuery] string? email)
    {
        var orders = await _orderService.GetAllOrdersAsync(email);
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<OrderResponse>> GetOrderById(Guid id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null)
        {
            return NotFound(new { message = $"Order with ID {id} was not found." });
        }
        return Ok(order);
    }

    [HttpPost("{id:guid}/confirm-delivery")]
    [AllowAnonymous]
    public async Task<ActionResult<OrderResponse>> ConfirmDelivery(Guid id, [FromBody] ConfirmDeliveryOtpRequest request)
    {
        try
        {
            var order = await _orderService.ConfirmDeliveryWithOtpAsync(id, request.Otp);
            return Ok(order);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/assign-driver")]
    [AllowAnonymous]
    public async Task<ActionResult<OrderResponse>> AssignDriver(Guid id, [FromBody] AssignOrderDriverRequest request)
    {
        try
        {
            var order = await _orderService.AssignDriverAsync(id, request.DriverId);
            return Ok(order);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/create-payment-link")]
    [AllowAnonymous]
    public async Task<ActionResult<CreateOrderPaymentLinkResponse>> CreatePaymentLink(Guid id)
    {
        try
        {
            var result = await _orderService.CreatePaymentLinkAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/pay")]
    [AllowAnonymous]
    public async Task<ActionResult<OrderResponse>> ProcessPayment(Guid id, [FromBody] ProcessOrderPaymentRequest? request)
    {
        try
        {
            var result = await _orderService.ProcessOrderPaymentAsync(id, request ?? new ProcessOrderPaymentRequest());
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
