using backend.Features.Auth.DTOs;

namespace backend.Features.Auth.Services;

public interface IAuthService
{
    Task<(LoginResponse? Response, string? RefreshToken)> LoginAsync(LoginRequest request);

    Task<(LoginResponse? Response, string? RefreshToken)> RefreshAsync(string refreshToken);

    Task RevokeRefreshTokenAsync(string refreshToken);

    CurrentUserResponse? GetCurrentUser();
}