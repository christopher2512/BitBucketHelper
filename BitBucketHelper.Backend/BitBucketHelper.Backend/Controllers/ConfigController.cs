using BitBucketHelper.Backend.Models;
using BitBucketHelper.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace BitBucketHelper.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfigController : ControllerBase
{
    private readonly ConfigService _configService;

    public ConfigController(ConfigService configService)
    {
        _configService = configService;
    }

    // ---------- User config ----------
    [HttpGet("user")]
    public ActionResult<UserConfig> GetUserConfig()
    {
        return Ok(_configService.GetUserConfig());
    }

    [HttpPost("user")]
    public IActionResult SaveUserConfig([FromBody] UserConfig config)
    {
        _configService.SaveUserConfig(config ?? new UserConfig());
        return Ok(new { success = true });
    }

    // ---------- Repo config ----------
    [HttpGet("repo")]
    public ActionResult<RepoConfig> GetRepoConfig()
    {
        return Ok(_configService.GetRepoConfig());
    }

    [HttpPost("repo")]
    public IActionResult SaveRepoConfig([FromBody] RepoConfig config)
    {
        _configService.SaveRepoConfig(config ?? new RepoConfig());
        return Ok(new { success = true });
    }

    // ---------- Branch list ----------
    [HttpGet("branches")]
    public ActionResult<BranchList> GetBranchList()
    {
        return Ok(_configService.GetBranchList());
    }

    [HttpPost("branches")]
    public IActionResult SaveBranchList([FromBody] BranchList branchList)
    {
        _configService.SaveBranchList(branchList ?? new BranchList());
        return Ok(new { success = true });
    }
}
