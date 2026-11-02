using System.Text.Json.Serialization;

namespace BitBucketHelper.Backend.Models;

/// <summary>
/// Response for a batch operation performed across multiple repositories.
/// </summary>
public class BatchOperationResponse
{
    [JsonPropertyName("results")]
    public List<OperationResult> Results { get; set; } = new();
}
