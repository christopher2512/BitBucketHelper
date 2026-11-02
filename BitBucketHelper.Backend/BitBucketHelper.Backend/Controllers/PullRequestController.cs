using BitBucketHelper.Backend.Models;
using BitBucketHelper.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace BitBucketHelper.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PullRequestController : ControllerBase
{
    private readonly ConfigService _configService;
    private readonly BitbucketService _bitbucketService;
    private readonly ILogger<PullRequestController> _logger;

    public PullRequestController(
        ConfigService configService,
        BitbucketService bitbucketService,
        ILogger<PullRequestController> logger)
    {
        _configService = configService;
        _bitbucketService = bitbucketService;
        _logger = logger;
    }

    /// <summary>
    /// Creates pull requests across all selected repositories for the given SPK.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BatchOperationResponse>> CreatePullRequests([FromBody] CreatePullRequestRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Spk))
            return BadRequest("SPK is required.");
        if (string.IsNullOrWhiteSpace(request.FromBranch) || string.IsNullOrWhiteSpace(request.ToBranch))
            return BadRequest("Both source and target branches are required.");

        var userConfig = _configService.GetUserConfig();
        if (string.IsNullOrWhiteSpace(userConfig.BitbucketBaseUrl) || string.IsNullOrWhiteSpace(userConfig.BitbucketToken))
            return BadRequest("Bitbucket base URL and token must be configured first.");

        var repos = _configService.GetReposForSpk(request.Spk, request.RepoSlugs);
        if (repos.Count == 0)
            return BadRequest($"No repositories found for SPK '{request.Spk}'.");

        var tasks = repos.Select(r => _bitbucketService.CreatePullRequestAsync(r, request, userConfig));
        var results = await Task.WhenAll(tasks);

        _logger.LogInformation("Created {Success}/{Total} pull requests for SPK {Spk}",
            results.Count(r => r.Success), results.Length, request.Spk);

        return Ok(new BatchOperationResponse { Results = results.ToList() });
    }
}
