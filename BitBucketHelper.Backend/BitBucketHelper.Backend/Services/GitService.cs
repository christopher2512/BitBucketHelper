using System.Diagnostics;
using BitBucketHelper.Backend.Models;

namespace BitBucketHelper.Backend.Services;

/// <summary>
/// Clones repositories locally by invoking the git CLI.
/// </summary>
public class GitService
{
    private readonly ILogger<GitService> _logger;

    public GitService(ILogger<GitService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Clones a single repository into a subfolder of <paramref name="localPath"/>.
    /// </summary>
    public async Task<OperationResult> CloneAsync(SpkRepoMapping repo, string cloneUrl, string localPath)
    {
        var result = new OperationResult
        {
            RepoSlug = repo.RepoSlug,
            RepoName = string.IsNullOrWhiteSpace(repo.RepoName) ? repo.RepoSlug : repo.RepoName
        };

        try
        {
            if (string.IsNullOrWhiteSpace(localPath) || !Directory.Exists(localPath))
            {
                result.Success = false;
                result.Message = $"Local path does not exist: {localPath}";
                return result;
            }

            var destFolder = string.IsNullOrWhiteSpace(repo.RepoName)
                ? repo.RepoSlug
                : repo.RepoName;
            var destPath = Path.Combine(localPath, destFolder);

            // Skip if already cloned.
            if (Directory.Exists(destPath) && Directory.EnumerateFileSystemEntries(destPath).Any())
            {
                result.Success = true;
                result.Message = $"Repository already present at {destPath} (skipped).";
                result.Link = destPath;
                return result;
            }

            var psi = new ProcessStartInfo
            {
                FileName = "git",
                Arguments = $"clone --progress \"{cloneUrl}\" \"{destPath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process { StartInfo = psi };
            process.Start();

            var stdoutTask = process.StandardOutput.ReadToEndAsync();
            var stderrTask = process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();
            var stderr = await stderrTask;
            var stdout = await stdoutTask;

            if (process.ExitCode == 0)
            {
                result.Success = true;
                result.Message = $"Cloned to {destPath}";
                result.Link = destPath;
            }
            else
            {
                result.Success = false;
                result.Message = $"git exit code {process.ExitCode}: {stderr.Trim()}";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to clone {RepoSlug}", repo.RepoSlug);
            result.Success = false;
            result.Message = ex.Message;
        }

        return result;
    }
}
