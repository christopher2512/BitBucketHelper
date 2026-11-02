using System.Text.Json.Serialization;

namespace BitBucketHelper.Backend.Models;

/// <summary>
/// A pull request reviewer entry.
/// </summary>
public class Reviewer
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>The Bitbucket user id/slug used by the API.</summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
}
