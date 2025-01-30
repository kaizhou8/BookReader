using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookReader.API.Models;
using BookReader.API.Services;

namespace BookReader.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UserController> _logger;

    public UserController(IUserService userService, ILogger<UserController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<User>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var user = await _userService.CreateUserAsync(request.Username, request.Password, request.Email);
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "注册用户失败");
            return StatusCode(500, "注册用户失败");
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var isValid = await _userService.ValidateCredentialsAsync(request.Username, request.Password);
            if (!isValid)
            {
                return Unauthorized("用户名或密码错误");
            }

            var user = await _userService.GetUserByUsernameAsync(request.Username);
            if (user == null)
            {
                return NotFound("用户不存在");
            }

            var token = await _userService.GenerateJwtTokenAsync(user);
            return Ok(new LoginResponse { Token = token, User = user });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "登录失败");
            return StatusCode(500, "登录失败");
        }
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(string id)
    {
        try
        {
            var user = await _userService.GetUserAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取用户信息失败，ID: {Id}", id);
            return StatusCode(500, "获取用户信息失败");
        }
    }

    [Authorize]
    [HttpPost("{userId}/books/{bookId}/progress")]
    public async Task<IActionResult> UpdateReadingProgress(
        string userId, string bookId, [FromBody] ReadingProgress progress)
    {
        try
        {
            await _userService.UpdateReadingProgressAsync(userId, bookId, progress);
            return Ok();
        }
        catch (KeyNotFoundException)
        {
            return NotFound("用户不存在");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "更新阅读进度失败，UserId: {UserId}, BookId: {BookId}", userId, bookId);
            return StatusCode(500, "更新阅读进度失败");
        }
    }

    [Authorize]
    [HttpGet("{userId}/books/{bookId}/progress")]
    public async Task<ActionResult<ReadingProgress>> GetReadingProgress(string userId, string bookId)
    {
        try
        {
            var progress = await _userService.GetReadingProgressAsync(userId, bookId);
            if (progress == null)
            {
                return NotFound();
            }
            return Ok(progress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取阅读进度失败，UserId: {UserId}, BookId: {BookId}", userId, bookId);
            return StatusCode(500, "获取阅读进度失败");
        }
    }

    [Authorize]
    [HttpPost("{userId}/bookmarks/{bookId}")]
    public async Task<IActionResult> AddBookmark(string userId, string bookId)
    {
        try
        {
            await _userService.AddBookmarkAsync(userId, bookId);
            return Ok();
        }
        catch (KeyNotFoundException)
        {
            return NotFound("用户不存在");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "添加书签失败，UserId: {UserId}, BookId: {BookId}", userId, bookId);
            return StatusCode(500, "添加书签失败");
        }
    }

    [Authorize]
    [HttpDelete("{userId}/bookmarks/{bookId}")]
    public async Task<IActionResult> RemoveBookmark(string userId, string bookId)
    {
        try
        {
            await _userService.RemoveBookmarkAsync(userId, bookId);
            return Ok();
        }
        catch (KeyNotFoundException)
        {
            return NotFound("用户不存在");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "删除书签失败，UserId: {UserId}, BookId: {BookId}", userId, bookId);
            return StatusCode(500, "删除书签失败");
        }
    }

    [Authorize]
    [HttpGet("{userId}/bookmarks")]
    public async Task<ActionResult<List<string>>> GetBookmarks(string userId)
    {
        try
        {
            var bookmarks = await _userService.GetBookmarksAsync(userId);
            return Ok(bookmarks);
        }
        catch (KeyNotFoundException)
        {
            return NotFound("用户不存在");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取书签列表失败，UserId: {UserId}", userId);
            return StatusCode(500, "获取书签列表失败");
        }
    }

    [Authorize]
    [HttpPost("{userId}/books/{bookId}/settings")]
    public async Task<IActionResult> UpdateReaderSettings(
        string userId, string bookId, [FromBody] ReaderSettings settings)
    {
        try
        {
            await _userService.UpdateReaderSettingsAsync(userId, bookId, settings);
            return Ok();
        }
        catch (KeyNotFoundException)
        {
            return NotFound("用户不存在");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "更新阅读设置失败，UserId: {UserId}, BookId: {BookId}", userId, bookId);
            return StatusCode(500, "更新阅读设置失败");
        }
    }
}
