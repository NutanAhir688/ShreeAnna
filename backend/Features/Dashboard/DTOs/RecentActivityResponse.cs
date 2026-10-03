namespace backend.Features.Dashboard.DTOs;

public class RecentActivityResponse
{
    public string Title { get; set; } = string.Empty;

    public string Subtitle { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;
}