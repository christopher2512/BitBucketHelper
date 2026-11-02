using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using BitBucketHelper.Backend.Models;

namespace BitBucketHelper.Backend.Services;

/// <summary>
/// Talks to the Bitbucket Server (on-prem) REST API to create pull requests,
/// create branches, and delete branches.
/// </summary>
public class BitbucketService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<BitbucketService> _logger;

    public BitbucketService(HttpClient httpClient, ILogger<BitbucketService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    private void ConfigureClient(UserConfig userConfig)
    {
        _httpClient.DefaultRequestHeaders.Clear();
        if (!string.IsNullOrWhiteSpace(userConfig.BitbucketToken))
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", userConfig.BitbucketToken);
        }
    }

    private string ApiBase(UserConfig userConfig)
    {
        var baseUrl = (userConfig.BitbucketBaseUrl ?? string.Empty).TrimEnd('/');
        return $"{baseUrl}/rest/api/1.0";
    }

    private string BranchUtilsBase(UserConfig userConfig)
    {
        var baseUrl = (userConfig.BitbucketBaseUrl ?? string.Empty).TrimEnd('/');
        return $"{baseUrl}/rest/branch-utils/1.0";
    }

    /// <summary>
    /// Creates a pull request in a single repository.
    /// </summary>
    public async Task<OperationResult> CreatePullRequestAsync(
        SpkRepoMapping repo,
        CreatePullRequestRequest request,
        UserConfig userConfig)
    {
        var result = new OperationResult
        {
            RepoSlug = repo.RepoSlug,
            RepoName = string.IsNullOrWhiteSpace(repo.RepoName) ? repo.RepoSlug : repo.RepoName
        };

        try
        {
            ConfigureClient(userConfig);

            var fromRef = $"refs/heads/{StripRefsPrefix(request.FromBranch)}";
            var toRef = $"refs/heads/{StripRefsPrefix(request.ToBranch)}";

            var payload = new JsonObject
            {
                ["title"] = string.IsNullOrWhiteSpace(request.Title)
                    ? $"{request.FromBranch} -> {request.ToBranch}"
                    : request.Title,
                ["description"] = request.Description ?? string.Empty,
                ["open"] = true,
                ["closed"] = false,
                ["fromRef"] = new JsonObject
                {
                    ["id"] = fromRef,
                    ["repository"] = new JsonObject
                    {
                        ["slug"] = repo.RepoSlug,
                        ["project"] = new JsonObject { ["key"] = repo.ProjectKey }
                    }
                },
                ["toRef"] = new JsonObject
                {
                    ["id"] = toRef,
                    ["repository"] = new JsonObject
                    {
                        ["slug"] = repo.RepoSlug,
                        ["project"] = new JsonObject { ["key"] = repo.ProjectKey }
                    }
                },
                ["locked"] = false,
                ["reviewers"] = new JsonArray(
                    request.ReviewerIds
                        .Where(id => !string.IsNullOrWhiteSpace(id))
                        .Select(id => (JsonNode)new JsonObject { ["user"] = new JsonObject { ["name"] = id } })
                        .ToArray())
            };

            var url = $"{ApiBase(userConfig)}/projects/{repo.ProjectKey}/repos/{repo.RepoSlug}/pull-requests";
            var content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);
            var body = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                result.Success = true;
                result.Message = "Pull request created successfully.";
                result.Link = ExtractSelfLink(body, userConfig);
            }
            else
            {
                result.Success = false;
                result.Message = ParseErrorMessage(body, response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create PR in {RepoSlug}", repo.RepoSlug);
            result.Success = false;
            result.Message = ex.Message;
        }

        return result;
    }

    /// <summary>
    /// Creates a branch in a single repository branching from a start point.
    /// </summary>
    public async Task<OperationResult> CreateBranchAsync(
        SpkRepoMapping repo,
        CreateBranchRequest request,
        UserConfig userConfig)
    {
        var result = new OperationResult
        {
            RepoSlug = repo.RepoSlug,
            RepoName = string.IsNullOrWhiteSpace(repo.RepoName) ? repo.RepoSlug : repo.RepoName
        };

        try
        {
            ConfigureClient(userConfig);

            var payload = new JsonObject
            {
                ["name"] = request.NewBranchName,
                ["startPoint"] = request.FromBranch,
                ["message"] = $"Create branch {request.NewBranchName} from {request.FromBranch}"
            };

            var url = $"{BranchUtilsBase(userConfig)}/projects/{repo.ProjectKey}/repos/{repo.RepoSlug}/branches";
            var content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);
            var body = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                result.Success = true;
                result.Message = $"Branch '{request.NewBranchName}' created from '{request.FromBranch}'.";
                result.Link = BuildBranchLink(userConfig, repo, request.NewBranchName);
            }
            else
            {
                result.Success = false;
                result.Message = ParseErrorMessage(body, response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create branch in {RepoSlug}", repo.RepoSlug);
            result.Success = false;
            result.Message = ex.Message;
        }

        return result;
    }

    /// <summary>
    /// Deletes a feature branch in a single repository.
    /// </summary>
    public async Task<OperationResult> DeleteBranchAsync(
        SpkRepoMapping repo,
        DeleteBranchRequest request,
        UserConfig userConfig)
    {
        var result = new OperationResult
        {
            RepoSlug = repo.RepoSlug,
            RepoName = string.IsNullOrWhiteSpace(repo.RepoName) ? repo.RepoSlug : repo.RepoName
        };

        try
        {
            ConfigureClient(userConfig);

            var url = $"{ApiBase(userConfig)}/projects/{repo.ProjectKey}/repos/{repo.RepoSlug}/branches" +
                       $"?name={Uri.EscapeDataString(request.BranchName)}&dryRun=false";
            var response = await _httpClient.DeleteAsync(url);
            var body = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                result.Success = true;
                result.Message = $"Branch '{request.BranchName}' deleted successfully.";
            }
            else
            {
                result.Success = false;
                result.Message = ParseErrorMessage(body, response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete branch in {RepoSlug}", repo.RepoSlug);
            result.Success = false;
            result.Message = ex.Message;
        }

        return result;
    }

    /// <summary>
    /// Builds an authenticated HTTP clone URL for the repository.
    /// </summary>
    public string GetCloneUrl(SpkRepoMapping repo, UserConfig userConfig)
    {
        var baseUri = new Uri(userConfig.BitbucketBaseUrl.TrimEnd('/') + "/");
        var project = repo.ProjectKey.ToLowerInvariant();
        var slug = repo.RepoSlug;

        // Embed the token as basic auth username so the clone works without prompts.
        var userInfo = string.IsNullOrWhiteSpace(userConfig.BitbucketToken)
            ? string.Empty
            : Uri.EscapeDataString(userConfig.BitbucketToken);
        var builder = new UriBuilder(baseUri)
        {
            UserName = userInfo,
            Path = $"scm/{project}/{slug}.git"
        };
        return builder.Uri.ToString();
    }

    private static string ExtractSelfLink(string body, UserConfig userConfig)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("links", out var links) &&
                links.TryGetProperty("self", out var self) &&
                self.GetArrayLength() > 0)
            {
                return self[0].GetProperty("href").GetString() ?? string.Empty;
            }
        }
        catch
        {
            // ignore parse errors
        }
        return userConfig.BitbucketBaseUrl.TrimEnd('/');
    }

    private string BuildBranchLink(UserConfig userConfig, SpkRepoMapping repo, string branchName)
    {
        return $"{userConfig.BitbucketBaseUrl.TrimEnd('/')}/projects/{repo.ProjectKey}/repos/{repo.RepoSlug}/browse?at={Uri.EscapeDataString("refs/heads/" + branchName)}";
    }

    /// <summary>Removes a leading "refs/heads/" if present so callers can pass either form.</summary>
    private static string StripRefsPrefix(string branch) =>
        branch.StartsWith("refs/heads/", StringComparison.OrdinalIgnoreCase)
            ? branch["refs/heads/".Length..]
            : branch;

    private static string ParseErrorMessage(string body, System.Net.HttpStatusCode status)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("errors", out var errors))
            {
                var first = errors.EnumerateArray().FirstOrDefault();
                if (first.ValueKind == JsonValueKind.Object &&
                    first.TryGetProperty("message", out var msg))
                {
                    return $"{(int)status} {status}: {msg.GetString()}";
                }
            }
            if (doc.RootElement.TryGetProperty("message", out var message))
            {
                return $"{(int)status} {status}: {message.GetString()}";
            }
        }
        catch
        {
            // fall through
        }
        return $"{(int)status} {status}: {body}";
    }
}
