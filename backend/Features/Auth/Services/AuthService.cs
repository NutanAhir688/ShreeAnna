using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.Features.Auth.DTOs;
using backend.Infrastructure.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace backend.Features.Auth.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly JwtOptions _jwtOptions;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthService(
        AppDbContext db,
        IOptions<JwtOptions> jwtOptions,
        IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _jwtOptions = jwtOptions.Value;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<(LoginResponse? Response, string? RefreshToken)> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users
            .Include(x => x.FpoMember)
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (user is null || !user.IsActive)
        {
            return (null, null);
        }

        var passwordValid = BCrypt.Net.BCrypt.Verify(
            request.Password,
            user.PasswordHash
        );

        if (!passwordValid)
        {
            return (null, null);
        }

        var expiresAt = DateTime.UtcNow
            .AddMinutes(_jwtOptions.ExpirationMinutes);

        var accessToken = GenerateToken(user, expiresAt);
        var refreshToken = GenerateRefreshTokenString();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _db.SaveChangesAsync();

        var response = new LoginResponse
        {
            AccessToken = accessToken,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role,
            MemberName = user.FpoMember?.Name
        };

        return (response, refreshToken);
    }

    public async Task<(LoginResponse? Response, string? RefreshToken)> RefreshAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return (null, null);
        }

        var user = await _db.Users
            .Include(x => x.FpoMember)
            .FirstOrDefaultAsync(x => x.RefreshToken == refreshToken && x.RefreshTokenExpiryTime > DateTime.UtcNow);

        if (user is null || !user.IsActive)
        {
            return (null, null);
        }

        var expiresAt = DateTime.UtcNow
            .AddMinutes(_jwtOptions.ExpirationMinutes);

        var newAccessToken = GenerateToken(user, expiresAt);
        var newRefreshToken = GenerateRefreshTokenString();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _db.SaveChangesAsync();

        var response = new LoginResponse
        {
            AccessToken = newAccessToken,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role,
            MemberName = user.FpoMember?.Name
        };

        return (response, newRefreshToken);
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken)) return;

        var user = await _db.Users
            .FirstOrDefaultAsync(x => x.RefreshToken == refreshToken);

        if (user is not null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _db.SaveChangesAsync();
        }
    }

    private static string GenerateRefreshTokenString()
    {
        var randomNumber = new byte[64];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public CurrentUserResponse? GetCurrentUser()
    {
        var user = _httpContextAccessor.HttpContext?.User;

        if (user?.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            return null;
        }

        return new CurrentUserResponse
        {
            UserId = parsedUserId,
            Email = user.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
            Role = user.FindFirstValue(ClaimTypes.Role) ?? string.Empty,
            MemberName = user.FindFirstValue("memberName")
        };
    }

    private string GenerateToken(
        Features.Auth.Entities.User user,
        DateTime expiresAt)
    {
        var claims = new List<Claim>
        {
            new(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()
            ),

            new(
                ClaimTypes.Email,
                user.Email
            ),

            new(
                ClaimTypes.Role,
                user.Role
            )
        };

        if (user.FpoMember is not null)
        {
            claims.Add(
                new Claim(
                    "memberName",
                    user.FpoMember.Name
                )
            );
        }

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_jwtOptions.Key)
        );

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}