using System.Text.Json.Serialization;

namespace BitBucketHelper.Backend.Models;

/// <summary>
/// Request to create pull requests across multiple repositories mapped to an SPK.
/// </summary>
public class CreatePullRequestRequest
{
    [JsonPropertyName("spk")]
    public string Spk { get; set; } = string.Empty;

    /// <summary>Repo slugs to create PRs in. Empty means all repos mapped to the SPK.</summary>
    [JsonPropertyName("repoSlugs")]
    public List<string> RepoSlugs { get; set; } = new();

    /// <summary>Source branch (feature branch) to merge from.</summary>
    [JsonPropertyName("fromBranch")]
    public string FromBranch { get; set; } = string.Empty;

    /// <summary>Target branch to merge into.</summary>
    [JsonPropertyName("toBranch")]
    public string ToBranch { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    /// <summary>Reviewer ids (Bitbucket user slugs) to add.</summary>
    [JsonPropertyName("reviewerIds")]
    public List<string> ReviewerIds { get; set; } = new();
}
