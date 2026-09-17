namespace backend.Infrastructure.Storage;

public class AzureStorageOptions
{
    public string ConnectionString { get; set; } = string.Empty;

    public string AccountName { get; set; } = "shreeannafarmimages";

    public string ContainerName { get; set; } = "farm-images";

    public string CdnBaseUrl { get; set; } = "https://shreeannafarmimages.blob.core.windows.net/farm-images";
}
