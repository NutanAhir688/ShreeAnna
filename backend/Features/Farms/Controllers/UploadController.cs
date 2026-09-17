using System.Security.Claims;
using backend.Infrastructure.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Farms.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IBlobStorageService _blobStorageService;

    public UploadController(IBlobStorageService blobStorageService)
    {
        _blobStorageService = blobStorageService;
    }

    /// <summary>
    /// Legacy server-side upload endpoint (multipart/form-data).
    /// Prefer the SAS-based endpoint below for new clients.
    /// </summary>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded." });
        }

        var farmerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var imageUrl = await _blobStorageService.UploadFarmImageAsync(file, farmerId);

        return Ok(new { imageUrl });
    }

    /// <summary>
    /// Returns a short-lived SAS write URL so the mobile client can PUT the
    /// image directly to Azure Blob Storage (zero backend bandwidth).
    ///
    /// GET /api/upload/sas?ext=jpg
    ///
    /// Response:
    /// {
    ///   "sasUrl":      "https://...blob.core.windows.net/...?sv=...&sig=...",
    ///   "permanentUrl":"https://...blob.core.windows.net/.../uuid.jpg"
    /// }
    /// </summary>
    [HttpGet("upload/sas")]
    public IActionResult GetSasUrl([FromQuery] string ext = "jpg")
    {
        var farmerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

        try
        {
            var (sasUrl, permanentUrl) = _blobStorageService.GenerateFarmImageSasUrl(farmerId, ext);
            return Ok(new { sasUrl, permanentUrl });
        }
        catch (InvalidOperationException ex)
        {
            // Storage not configured – return 503 so the client can fall back
            return StatusCode(503, new { message = ex.Message });
        }
    }
}
