using System.Text.Json.Serialization;

namespace BitBucketHelper.Backend.Models;

/// <summary>
/// Repository configuration stored in Config/RepoConfig.json.
/// Contains SPK/Repo mappings and reviewer list.
/// </summary>
public class RepoConfig
{
    [JsonPropertyName("spkRepoMappings")]
    public List<SpkRepoMapping> SpkRepoMappings { get; set; } = new();

    [JsonPropertyName("reviewers")]
    public List<Reviewer> Reviewers { get; set; } = new();
}
