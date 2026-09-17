using Microsoft.Extensions.Options;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Azure.Storage;

namespace backend.Infrastructure.Storage;

public interface IBlobStorageService
{
    Task<string> UploadFarmImageAsync(IFormFile file, string farmerId);

    /// <summary>
    /// Generates a short-lived SAS write URL the client can use to upload
    /// directly to Azure Blob Storage, together with the final public URL
    /// the blob will have once it is uploaded.
    /// </summary>
    (string sasUrl, string permanentUrl) GenerateFarmImageSasUrl(
        string farmerId, string extension, int expiryMinutes = 10);
}

public class AzureBlobStorageService : IBlobStorageService
{
    private readonly AzureStorageOptions _options;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<AzureBlobStorageService> _logger;

    public AzureBlobStorageService(
        IOptions<AzureStorageOptions> options,
        IWebHostEnvironment environment,
        ILogger<AzureBlobStorageService> logger)
    {
        _options = options.Value;
        _environment = environment;
        _logger = logger;
    }
    private static readonly HashSet<string> AllowedExtensions =
    [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ];

    public async Task<string> UploadFarmImageAsync(IFormFile file, string farmerId)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("No file provided for upload.");
        }

        const long maxFileSize = 5 * 1024 * 1024;

        if (file.Length > maxFileSize)
        {
            throw new ArgumentException("Image size cannot exceed 5 MB.");
        }

        if (string.IsNullOrWhiteSpace(file.ContentType) ||
            !file.ContentType.StartsWith(
                "image/",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Only image files are allowed.");
        }

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (string.IsNullOrEmpty(ext))
        {
            ext = ".jpg";
        }

        if (!AllowedExtensions.Contains(ext))
        {
            throw new ArgumentException("Unsupported image format.");
        }

        var blobFileName = $"{Guid.NewGuid():N}{ext}";

        var blobRelativePath = string.IsNullOrWhiteSpace(farmerId)
            ? $"farms/{blobFileName}"
            : $"farms/{farmerId}/{blobFileName}";
            

        var connectionString = _options.ConnectionString;
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = Environment.GetEnvironmentVariable("AZURE_STORAGE_CONNECTION_STRING") ?? string.Empty;
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return await SaveLocallyAsync(file, blobRelativePath);
        }

        try
        {
            var containerClient = new BlobContainerClient(connectionString, _options.ContainerName);
            // await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

            var blobClient = containerClient.GetBlobClient(blobRelativePath);
            var blobHttpHeaders = new BlobHttpHeaders
            {
                ContentType = file.ContentType ?? "image/jpeg"
            };

            using (var stream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, new BlobUploadOptions
                {
                    HttpHeaders = blobHttpHeaders
                });
            }

            _logger.LogInformation("Successfully uploaded blob to Azure Storage: {Uri}", blobClient.Uri);
            return blobClient.Uri.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload file to Azure Blob Storage.");
            throw;
        }
    }

    public (string sasUrl, string permanentUrl) GenerateFarmImageSasUrl(
        string farmerId,
        string extension,
        int expiryMinutes = 10)
    {
        var ext = extension.Trim().ToLowerInvariant();

        if (!ext.StartsWith('.'))
        {
            ext = "." + ext;
        }

        var allowedExtensions = new HashSet<string>
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

        if (!allowedExtensions.Contains(ext))
        {
            throw new ArgumentException("Unsupported image format.");
        }

        if (expiryMinutes <= 0 || expiryMinutes > 30)
        {
            throw new ArgumentException("Expiry must be between 1 and 30 minutes.");
        }

        var blobFileName = $"{Guid.NewGuid():N}{ext}";

        var blobRelativePath = string.IsNullOrWhiteSpace(farmerId)
            ? $"farms/{blobFileName}"
            : $"farms/{farmerId}/{blobFileName}";

        var connectionString = _options.ConnectionString;

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = Environment.GetEnvironmentVariable(
                "AZURE_STORAGE_CONNECTION_STRING");
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Azure Storage connection string is not configured.");
        }

        var containerClient = new BlobContainerClient(
            connectionString,
            _options.ContainerName);

        var blobClient = containerClient.GetBlobClient(blobRelativePath);

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _options.ContainerName,
            BlobName = blobRelativePath,
            Resource = "b",
            StartsOn = DateTimeOffset.UtcNow.AddMinutes(-1),
            ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(expiryMinutes),
            ContentType = "image/" + ext.TrimStart('.')
        };

        sasBuilder.SetPermissions(
            BlobSasPermissions.Create |
            BlobSasPermissions.Write);

        var sasUri = blobClient.GenerateSasUri(sasBuilder);

        // Front Door URL, not direct Blob Storage URL.
        var permanentUrl =
            $"{_options.CdnBaseUrl.TrimEnd('/')}/{blobRelativePath}";

        _logger.LogInformation(
            "Generated upload SAS for blob {BlobPath}",
            blobRelativePath);

        return (sasUri.ToString(), permanentUrl);
    }

    private async Task<string> SaveLocallyAsync(IFormFile file, string blobRelativePath)
    {
        var uploadsRoot = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
        var localFilePath = Path.Combine(uploadsRoot, blobRelativePath.Replace('/', Path.DirectorySeparatorChar));
        var localDirectory = Path.GetDirectoryName(localFilePath);

        if (!string.IsNullOrWhiteSpace(localDirectory))
        {
            Directory.CreateDirectory(localDirectory);
        }

        await using (var stream = File.Create(localFilePath))
        {
            await file.CopyToAsync(stream);
        }

        // var publicUrl = _options.CdnBaseUrl.TrimEnd('/') + "/" + blobRelativePath;
        var publicUrl =
    $"{_options.CdnBaseUrl.TrimEnd('/')}/uploads/{blobRelativePath}";

        _logger.LogInformation("Saved farm image locally at {Path} and exposed it as {Url}", localFilePath, publicUrl);

        return publicUrl;
    }
}
