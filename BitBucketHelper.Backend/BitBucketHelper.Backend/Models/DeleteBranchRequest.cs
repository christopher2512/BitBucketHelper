using System.Text.Json.Serialization;

namespace BitBucketHelper.Backend.Models;

/// <summary>
/// Request to delete a feature branch across multiple repositories mapped to an SPK.
/// </summary>
public class DeleteBranchRequest
{
    [JsonPropertyName("spk")]
    public string Spk { get; set; } = string.Empty;

    [JsonPropertyName("repoSlugs")]
    public List<string> RepoSlugs { get; set; } = new();

    /// <summary>Name of the feature branch to delete.</summary>
    [JsonPropertyName("branchName")]
    public string BranchName { get; set; } = string.Empty;
}
