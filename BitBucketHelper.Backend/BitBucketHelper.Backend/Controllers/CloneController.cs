using BitBucketHelper.Backend.Models;
using BitBucketHelper.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace BitBucketHelper.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CloneController : ControllerBase
{
    private readonly ConfigService _configService;
    private readonly BitbucketService _bitbucketService;
    private readonly GitService _gitService;
    private readonly ILogger<CloneController> _logger;

    public CloneController(
        ConfigService configService,
        BitbucketService bitbucketService,
        GitService gitService,
        ILogger<CloneController> logger)
    {
        _configService = configService;
        _bitbucketService = bitbucketService;
        _gitService = gitService;
        _logger = logger;
    }

    /// <summary>
    /// Clones all selected repositories for the given SPK into a local folder.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BatchOperationResponse>> CloneRepos([FromBody] CloneRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Spk))
            return BadRequest("SPK is required.");
        if (string.IsNullOrWhiteSpace(request.LocalPath))
            return BadRequest("A local destination path is required.");

        var userConfig = _configService.GetUserConfig();
        if (string.IsNullOrWhiteSpace(userConfig.BitbucketBaseUrl) || string.IsNullOrWhiteSpace(userConfig.BitbucketToken))
            return BadRequest("Bitbucket base URL and token must be configured first.");

        var repos = _configService.GetReposForSpk(request.Spk, request.RepoSlugs);
        if (repos.Count == 0)
            return BadRequest($"No repositories found for SPK '{request.Spk}'.");

        // Cloning is IO heavy; run in parallel.
        var tasks = repos.Select(async r =>
        {
            var cloneUrl = _bitbucketService.GetCloneUrl(r, userConfig);
            return await _gitService.CloneAsync(r, cloneUrl, request.LocalPath);
        });
        var results = await Task.WhenAll(tasks);

        _logger.LogInformation("Cloned {Success}/{Total} repos for SPK {Spk}",
            results.Count(r => r.Success), results.Length, request.Spk);

        return Ok(new BatchOperationResponse { Results = results.ToList() });
    }
}
