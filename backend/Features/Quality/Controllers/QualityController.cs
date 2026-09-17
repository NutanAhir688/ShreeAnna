using backend.Features.Quality.DTOs;
using backend.Features.Quality.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Quality.Controllers;

[ApiController]
[Route("api/quality")]
[Authorize]
public class QualityController : ControllerBase
{
    private readonly IQualityService _qualityService;

    public QualityController(IQualityService qualityService)
    {
        _qualityService = qualityService;
    }

    [HttpGet("inspections")]
    public async Task<ActionResult<List<InspectionResponse>>> GetAllInspections()
    {
        var result = await _qualityService.GetAllInspectionsAsync();
        return Ok(result);
    }

    [HttpGet("inspections/lot/{lotId:guid}")]
    public async Task<ActionResult<InspectionResponse>> GetByLotId(Guid lotId)
    {
        var result = await _qualityService.GetInspectionByLotIdAsync(lotId);
        if (result is null) return NotFound(new { message = "Inspection not found for lot." });
        return Ok(result);
    }

    [HttpPost("inspections")]
    public async Task<ActionResult<InspectionResponse>> CreateInspection(CreateInspectionRequest request)
    {
        try
        {
            var result = await _qualityService.CreateInspectionAsync(request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("certificates")]
    public async Task<ActionResult<List<QualityCertificateResponse>>> GetAllCertificates()
    {
        var result = await _qualityService.GetAllCertificatesAsync();
        return Ok(result);
    }

    [HttpGet("certificates/lot/{lotId:guid}")]
    public async Task<ActionResult<QualityCertificateResponse>> GetCertificate(Guid lotId)
    {
        var result = await _qualityService.GetCertificateByLotIdAsync(lotId);
        if (result is null) return NotFound(new { message = "Certificate not found." });
        return Ok(result);
    }
}
