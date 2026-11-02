using System.Text.Json.Serialization;

namespace BitBucketHelper.Backend.Models;

/// <summary>
/// A mapping row linking an SPK grouping to a single Bitbucket repository.
/// </summary>
public class SpkRepoMapping
{
    [JsonPropertyName("spk")]
    public string Spk { get; set; } = string.Empty;

    [JsonPropertyName("projectKey")]
    public string ProjectKey { get; set; } = string.Empty;

    [JsonPropertyName("repoSlug")]
    public string RepoSlug { get; set; } = string.Empty;

    /// <summary>Optional friendly name for display.</summary>
    [JsonPropertyName("repoName")]
    public string RepoName { get; set; } = string.Empty;
}
