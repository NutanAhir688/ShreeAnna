using backend.Features.Auth.DTOs;
using backend.Features.Auth.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Auth.Controllers;

public class RefreshRequest
{
    public string? RefreshToken { get; set; }
}

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var (response, refreshToken) = await _authService.LoginAsync(request);

        if (response is null || string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        SetRefreshTokenCookie(refreshToken);

        return Ok(response);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Refresh([FromBody] RefreshRequest? request)
    {
        var refreshToken = Request.Cookies["refreshToken"] ?? request?.RefreshToken;

        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return Unauthorized(new { message = "No refresh token provided." });
        }

        var (response, newRefreshToken) = await _authService.RefreshAsync(refreshToken);

        if (response is null || string.IsNullOrEmpty(newRefreshToken))
        {
            return Unauthorized(new { message = "Invalid or expired refresh token." });
        }

        SetRefreshTokenCookie(newRefreshToken);

        return Ok(response);
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            await _authService.RevokeRefreshTokenAsync(refreshToken);
        }

        Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax
        });

        return Ok(new { message = "Logged out successfully." });
    }

    [HttpGet("me")]
    [Authorize]
    public ActionResult<CurrentUserResponse> GetCurrentUser()
    {
        var user = _authService.GetCurrentUser();

        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(user);
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = DateTime.UtcNow.AddDays(7),
            SameSite = SameSiteMode.Lax,
            Secure = false // set true in production for HTTPS
        };
        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}