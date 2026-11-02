using System.Text.Json.Serialization;

namespace BitBucketHelper.Backend.Models;

/// <summary>
/// Branch list stored in Config/BranchList.json.
/// </summary>
public class BranchList
{
    [JsonPropertyName("branches")]
    public List<string> Branches { get; set; } = new();
}
