using System.Text.Json.Serialization;

namespace BitBucketHelper.Backend.Models;

/// <summary>
/// Request to create a branch across multiple repositories mapped to an SPK.
/// </summary>
public class CreateBranchRequest
{
    [JsonPropertyName("spk")]
    public string Spk { get; set; } = string.Empty;

    [JsonPropertyName("repoSlugs")]
    public List<string> RepoSlugs { get; set; } = new();

    /// <summary>Start point (existing branch) to branch from.</summary>
    [JsonPropertyName("fromBranch")]
    public string FromBranch { get; set; } = string.Empty;

    /// <summary>Name of the new branch to create.</summary>
    [JsonPropertyName("newBranchName")]
    public string NewBranchName { get; set; } = string.Empty;
}
