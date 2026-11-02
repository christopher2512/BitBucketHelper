using System.Text.Json.Serialization;

namespace BitBucketHelper.Backend.Models;

/// <summary>
/// User configuration stored in Config/UserConfig.json.
/// </summary>
public class UserConfig
{
    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("bitbucketToken")]
    public string BitbucketToken { get; set; } = string.Empty;

    /// <summary>
    /// Base URL of the Bitbucket Server (on-prem) instance, e.g. https://bitbucket.example.com.
    /// </summary>
    [JsonPropertyName("bitbucketBaseUrl")]
    public string BitbucketBaseUrl { get; set; } = string.Empty;

    [JsonPropertyName("theme")]
    public string Theme { get; set; } = "light";
}
