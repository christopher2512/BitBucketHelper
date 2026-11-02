using BitBucketHelper.Backend.Models;
using BitBucketHelper.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace BitBucketHelper.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BranchController : ControllerBase
{
    private readonly ConfigService _configService;
    private readonly BitbucketService _bitbucketService;
    private readonly ILogger<BranchController> _logger;

    public BranchController(
        ConfigService configService,
        BitbucketService bitbucketService,
        ILogger<BranchController> logger)
    {
        _configService = configService;
        _bitbucketService = bitbucketService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new branch across all selected repositories for the given SPK.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BatchOperationResponse>> CreateBranches([FromBody] CreateBranchRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Spk))
            return BadRequest("SPK is required.");
        if (string.IsNullOrWhiteSpace(request.FromBranch) || string.IsNullOrWhiteSpace(request.NewBranchName))
            return BadRequest("Source branch and new branch name are required.");

        var userConfig = _configService.GetUserConfig();
        if (string.IsNullOrWhiteSpace(userConfig.BitbucketBaseUrl) || string.IsNullOrWhiteSpace(userConfig.BitbucketToken))
            return BadRequest("Bitbucket base URL and token must be configured first.");

        var repos = _configService.GetReposForSpk(request.Spk, request.RepoSlugs);
        if (repos.Count == 0)
            return BadRequest($"No repositories found for SPK '{request.Spk}'.");

        var tasks = repos.Select(r => _bitbucketService.CreateBranchAsync(r, request, userConfig));
        var results = await Task.WhenAll(tasks);

        _logger.LogInformation("Created branch {Branch} in {Success}/{Total} repos for SPK {Spk}",
            request.NewBranchName, results.Count(r => r.Success), results.Length, request.Spk);

        return Ok(new BatchOperationResponse { Results = results.ToList() });
    }

    /// <summary>
    /// Deletes a feature branch across all selected repositories for the given SPK.
    /// </summary>
    [HttpDelete]
    public async Task<ActionResult<BatchOperationResponse>> DeleteBranches([FromBody] DeleteBranchRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Spk))
            return BadRequest("SPK is required.");
        if (string.IsNullOrWhiteSpace(request.BranchName))
            return BadRequest("Branch name is required.");

        var userConfig = _configService.GetUserConfig();
        if (string.IsNullOrWhiteSpace(userConfig.BitbucketBaseUrl) || string.IsNullOrWhiteSpace(userConfig.BitbucketToken))
            return BadRequest("Bitbucket base URL and token must be configured first.");

        var repos = _configService.GetReposForSpk(request.Spk, request.RepoSlugs);
        if (repos.Count == 0)
            return BadRequest($"No repositories found for SPK '{request.Spk}'.");

        var tasks = repos.Select(r => _bitbucketService.DeleteBranchAsync(r, request, userConfig));
        var results = await Task.WhenAll(tasks);

        _logger.LogInformation("Deleted branch {Branch} in {Success}/{Total} repos for SPK {Spk}",
            request.BranchName, results.Count(r => r.Success), results.Length, request.Spk);

        return Ok(new BatchOperationResponse { Results = results.ToList() });
    }
}
