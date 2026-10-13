using backend.Features.Auth.DTOs;
using backend.Features.Auth.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Auth.Controllers;

[ApiController]
[Route("api/auth/driver")]
public class DriverAuthController : ControllerBase
{
    private readonly IDriverAuthService _driverAuthService;

    public DriverAuthController(IDriverAuthService driverAuthService)
    {
        _driverAuthService = driverAuthService;
    }

    [HttpPost("send-otp")]
    [AllowAnonymous]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
    {
        var sent = await _driverAuthService.SendOtpAsync(request.Phone);
        if (!sent)
        {
            return NotFound(new
            {
                message = "No registered driver found with this mobile number. Please check with logistics coordinator."
            });
        }

        return Ok(new
        {
            message = "OTP sent successfully."
        });
    }

    [HttpPost("verify-otp")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var response = await _driverAuthService.VerifyOtpAsync(request.Phone, request.Otp);
        if (response is null)
        {
            return Unauthorized(new
            {
                message = "Invalid or expired OTP."
            });
        }

        return Ok(response);
    }

    [HttpPost("direct-login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> DirectLogin([FromBody] SendOtpRequest request)
    {
        var response = await _driverAuthService.DirectLoginAsync(request.Phone);
        if (response is null)
        {
            return NotFound(new
            {
                message = "Driver not found with this mobile number."
            });
        }

        return Ok(response);
    }
}
