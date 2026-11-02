using System.Text.Json.Serialization;

namespace BitBucketHelper.Backend.Models;

/// <summary>
/// Request to clone one or more repositories mapped to an SPK into a local folder.
/// </summary>
public class CloneRequest
{
    [JsonPropertyName("spk")]
    public string Spk { get; set; } = string.Empty;

    [JsonPropertyName("repoSlugs")]
    public List<string> RepoSlugs { get; set; } = new();

    /// <summary>Local destination folder where each repo will be cloned into its own subfolder.</summary>
    [JsonPropertyName("localPath")]
    public string LocalPath { get; set; } = string.Empty;
}
