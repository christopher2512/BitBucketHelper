using System.Text.Json.Serialization;

namespace BitBucketHelper.Backend.Models;

/// <summary>
/// Result of a single repository operation within a batch.
/// </summary>
public class OperationResult
{
    [JsonPropertyName("repoSlug")]
    public string RepoSlug { get; set; } = string.Empty;

    [JsonPropertyName("repoName")]
    public string RepoName { get; set; } = string.Empty;

    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    /// <summary>Link to the created resource (pull request, branch) when applicable.</summary>
    [JsonPropertyName("link")]
    public string Link { get; set; } = string.Empty;
}
