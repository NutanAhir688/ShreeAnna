using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.Features.Auth;
using backend.Features.Auth.DTOs;
using backend.Features.Farmers.Entities;
using backend.Infrastructure.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace backend.Features.Auth.Services;

public class FarmerAuthService : IFarmerAuthService
{
    private readonly AppDbContext _context;
    private readonly IOtpService _otpService;
    private readonly JwtOptions _jwtOptions;
    private readonly ILogger<FarmerAuthService> _logger;

    public FarmerAuthService(
        AppDbContext context,
        IOtpService otpService,
        IOptions<JwtOptions> jwtOptions,
        ILogger<FarmerAuthService> logger)
    {
        _context = context;
        _otpService = otpService;
        _jwtOptions = jwtOptions.Value;
        _logger = logger;
    }

    public async Task<bool> SendOtpAsync(string phone)
    {
        phone = NormalizePhone(phone);

        var farmer = await _context.Farmers
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Phone == phone);

        if (farmer is null)
        {
            return false;
        }

        await _otpService.GenerateAndSaveOtpAsync(phone);

        return true;
    }

    public async Task<LoginResponse?> VerifyOtpAsync(
        string phone,
        string otp)
    {
        phone = NormalizePhone(phone);

        var farmer = await _context.Farmers
            .FirstOrDefaultAsync(x => x.Phone == phone);

        if (farmer is null)
        {
            return null;
        }

        if (farmer.Status != "Active")
        {
            return null;
        }

        var isValid = await _otpService.VerifyOtpAsync(
            phone,
            otp);
        _logger.LogInformation(
            "OTP verification result for {Phone}: {IsValid}",
            phone,
            isValid);

        if (!isValid)
        {
            return null;
        }

        return GenerateToken(farmer);
    }

    public async Task<LoginResponse?> DirectLoginAsync(string phone)
    {
        phone = NormalizePhone(phone);

        var farmer = await _context.Farmers
            .FirstOrDefaultAsync(x => x.Phone == phone);

        if (farmer is null)
        {
            return null;
        }

        if (farmer.Status != "Active")
        {
            return null;
        }

        return GenerateToken(farmer);
    }

    private LoginResponse GenerateToken(Farmer farmer)
    {
        var expiresAt = DateTime.UtcNow
            .AddMinutes(_jwtOptions.ExpirationMinutes);

        var claims = new List<Claim>
        {
            new(
                JwtRegisteredClaimNames.Sub,
                farmer.Id.ToString()
            ),

            new(
                ClaimTypes.NameIdentifier,
                farmer.Id.ToString()
            ),

            new(
                ClaimTypes.MobilePhone,
                farmer.Phone
            ),

            new(
                ClaimTypes.Name,
                farmer.FullName
            ),

            new(
                ClaimTypes.Role,
                Roles.Farmer
            ),

            new(
                "farmerCode",
                farmer.FarmerCode
            )
        };

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

        return new LoginResponse
        {
            AccessToken = new JwtSecurityTokenHandler()
                .WriteToken(token),

            ExpiresAt = expiresAt,

            UserId = farmer.Id,

            Email = farmer.Email,

            Role = Roles.Farmer,

            MemberName = farmer.FullName
        };
    }

    private static string NormalizePhone(string phone)
    {
        return phone.Trim();
    }
}