using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BookReader.API.Models;
using Microsoft.IdentityModel.Tokens;

namespace BookReader.API.Services;

public class UserService : IUserService
{
    private readonly ILogger<UserService> _logger;
    private readonly Dictionary<string, User> _users = new();  // 临时使用内存存储，后续替换为数据库
    private readonly string _jwtSecret;

    public UserService(ILogger<UserService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _jwtSecret = configuration["Jwt:Secret"] ?? throw new ArgumentNullException("Jwt:Secret");
    }

    public async Task<User?> GetUserAsync(string id)
    {
        return _users.GetValueOrDefault(id);
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        return _users.Values.FirstOrDefault(u => u.Username == username);
    }

    public async Task<User> CreateUserAsync(string username, string password, string? email)
    {
        if (await GetUserByUsernameAsync(username) != null)
        {
            throw new InvalidOperationException("用户名已存在");
        }

        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            Username = username,
            PasswordHash = HashPassword(password),
            Email = email,
            CreateTime = DateTime.UtcNow,
            UpdateTime = DateTime.UtcNow
        };

        _users[user.Id] = user;
        return user;
    }

    public async Task<bool> ValidateCredentialsAsync(string username, string password)
    {
        var user = await GetUserByUsernameAsync(username);
        if (user == null)
        {
            return false;
        }

        return VerifyPassword(password, user.PasswordHash);
    }

    public async Task<string> GenerateJwtTokenAsync(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSecret);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.NameIdentifier, user.Id)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public async Task UpdateReadingProgressAsync(string userId, string bookId, ReadingProgress progress)
    {
        var user = await GetUserAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("用户不存在");
        }

        progress.LastReadTime = DateTime.UtcNow;
        user.ReadingProgresses[bookId] = progress;
        user.UpdateTime = DateTime.UtcNow;
    }

    public async Task<ReadingProgress?> GetReadingProgressAsync(string userId, string bookId)
    {
        var user = await GetUserAsync(userId);
        return user?.ReadingProgresses.GetValueOrDefault(bookId);
    }

    public async Task AddBookmarkAsync(string userId, string bookId)
    {
        var user = await GetUserAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("用户不存在");
        }

        if (!user.BookmarkIds.Contains(bookId))
        {
            user.BookmarkIds.Add(bookId);
            user.UpdateTime = DateTime.UtcNow;
        }
    }

    public async Task RemoveBookmarkAsync(string userId, string bookId)
    {
        var user = await GetUserAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("用户不存在");
        }

        if (user.BookmarkIds.Remove(bookId))
        {
            user.UpdateTime = DateTime.UtcNow;
        }
    }

    public async Task<List<string>> GetBookmarksAsync(string userId)
    {
        var user = await GetUserAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("用户不存在");
        }

        return user.BookmarkIds;
    }

    public async Task UpdateReaderSettingsAsync(string userId, string bookId, ReaderSettings settings)
    {
        var user = await GetUserAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("用户不存在");
        }

        if (!user.ReadingProgresses.TryGetValue(bookId, out var progress))
        {
            progress = new ReadingProgress
            {
                BookId = bookId,
                ChapterIndex = 0,
                Position = 0,
                LastReadTime = DateTime.UtcNow
            };
            user.ReadingProgresses[bookId] = progress;
        }

        progress.Settings = settings;
        user.UpdateTime = DateTime.UtcNow;
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    private bool VerifyPassword(string password, string hash)
    {
        return HashPassword(password) == hash;
    }
}
