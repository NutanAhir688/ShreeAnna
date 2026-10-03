using backend.Features.Quality.DTOs;

namespace backend.Features.Quality.Services;

public interface IQualityService
{
    Task<List<InspectionResponse>> GetAllInspectionsAsync();

    Task<InspectionResponse?> GetInspectionByLotIdAsync(
        Guid lotId);

    Task<InspectionResponse> CreateInspectionAsync(
        CreateInspectionRequest request);

    Task<List<QualityCertificateResponse>> GetAllCertificatesAsync();

    Task<QualityCertificateResponse?> GetCertificateByLotIdAsync(
        Guid lotId);

    Task<QualityCertificateResponse?> VerifyCertificateAsync(
        string certificateNumber);
}