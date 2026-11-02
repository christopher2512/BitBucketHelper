using System.Text.Json;
using BitBucketHelper.Backend.Models;

namespace BitBucketHelper.Backend.Services;

/// <summary>
/// Loads and persists the three configuration JSON files that live in the Config folder.
/// </summary>
public class ConfigService
{
    private readonly string _configDirectory;
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        WriteIndented = true,
        PropertyNameCaseInsensitive = true
    };

    public ConfigService(IWebHostEnvironment env)
    {
        _configDirectory = Path.Combine(env.ContentRootPath, "Config");
        Directory.CreateDirectory(_configDirectory);
    }

    // ---------- UserConfig ----------
    public UserConfig GetUserConfig()
    {
        var path = Path.Combine(_configDirectory, "UserConfig.json");
        return ReadFile<UserConfig>(path) ?? new UserConfig();
    }

    public void SaveUserConfig(UserConfig config)
    {
        var path = Path.Combine(_configDirectory, "UserConfig.json");
        WriteFile(path, config);
    }

    // ---------- RepoConfig ----------
    public RepoConfig GetRepoConfig()
    {
        var path = Path.Combine(_configDirectory, "RepoConfig.json");
        return ReadFile<RepoConfig>(path) ?? new RepoConfig();
    }

    public void SaveRepoConfig(RepoConfig config)
    {
        var path = Path.Combine(_configDirectory, "RepoConfig.json");
        WriteFile(path, config);
    }

    // ---------- BranchList ----------
    public BranchList GetBranchList()
    {
        var path = Path.Combine(_configDirectory, "BranchList.json");
        return ReadFile<BranchList>(path) ?? new BranchList();
    }

    public void SaveBranchList(BranchList branchList)
    {
        var path = Path.Combine(_configDirectory, "BranchList.json");
        WriteFile(path, branchList);
    }

    // ---------- helpers ----------
    /// <summary>
    /// Returns the repositories mapped to an SPK, optionally filtered by selected repo slugs.
    /// If <paramref name="repoSlugs"/> is empty, all repos for the SPK are returned.
    /// </summary>
    public List<SpkRepoMapping> GetReposForSpk(string spk, List<string>? repoSlugs)
    {
        var repoConfig = GetRepoConfig();
        var all = repoConfig.SpkRepoMappings
            .Where(m => string.Equals(m.Spk, spk, StringComparison.OrdinalIgnoreCase))
            .ToList();

        if (repoSlugs is null || repoSlugs.Count == 0)
            return all;

        return all
            .Where(m => repoSlugs.Contains(m.RepoSlug, StringComparer.OrdinalIgnoreCase))
            .ToList();
    }

    private static T? ReadFile<T>(string path) where T : class, new()
    {
        if (!File.Exists(path))
        {
            // Ensure the file exists with an empty object so it stays human-editable.
            File.WriteAllText(path, JsonSerializer.Serialize(new T(), _jsonOptions));
            return new T();
        }

        var json = File.ReadAllText(path);
        if (string.IsNullOrWhiteSpace(json) || json.Trim() == "{}")
        {
            return new T();
        }

        return JsonSerializer.Deserialize<T>(json, _jsonOptions);
    }

    private static void WriteFile<T>(string path, T value)
    {
        var json = JsonSerializer.Serialize(value, _jsonOptions);
        File.WriteAllText(path, json);
    }
}
