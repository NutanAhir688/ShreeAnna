using backend.Features.Auth.DTOs;
using backend.Features.Auth.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Auth.Controllers;

[ApiController]
[Route("api/auth/farmer")]
public class FarmerAuthController : ControllerBase
{
    private readonly IFarmerAuthService _farmerAuthService;

    public FarmerAuthController(
        IFarmerAuthService farmerAuthService)
    {
        _farmerAuthService = farmerAuthService;
    }

    [HttpPost("send-otp")]
    [AllowAnonymous]
    public async Task<IActionResult> SendOtp(
        SendOtpRequest request)
    {
        var sent = await _farmerAuthService
            .SendOtpAsync(request.Phone);

        if (!sent)
        {
            return NotFound(new
            {
                message = "No farmer account found with this mobile number."
            });
        }

        return Ok(new
        {
            message = "OTP sent successfully."
        });
    }
    [HttpGet("test")]
    [Authorize(Roles = Roles.Farmer)]
    public IActionResult Test()
    {
        return Ok(new
        {
            message = "Farmer authentication is working."
        });
    }

    [HttpPost("verify-otp")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> VerifyOtp(
        VerifyOtpRequest request)
    {
        var response = await _farmerAuthService
            .VerifyOtpAsync(
                request.Phone,
                request.Otp);

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
        var response = await _farmerAuthService.DirectLoginAsync(request.Phone);
        if (response is null)
        {
            return NotFound(new
            {
                message = "No active farmer account found with this mobile number."
            });
        }

        return Ok(response);
    }
}