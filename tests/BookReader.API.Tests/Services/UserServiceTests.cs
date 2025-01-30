using BookReader.API.Models;
using BookReader.API.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace BookReader.API.Tests.Services;

public class UserServiceTests
{
    private readonly Mock<ILogger<UserService>> _loggerMock;
    private readonly Mock<IConfiguration> _configMock;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        _loggerMock = new Mock<ILogger<UserService>>();
        _configMock = new Mock<IConfiguration>();
        _configMock.Setup(x => x["Jwt:Secret"]).Returns("your-256-bit-secret-your-256-bit-secret-your-256-bit-secret");
        _userService = new UserService(_loggerMock.Object, _configMock.Object);
    }

    [Fact]
    public async Task CreateUser_ShouldCreateNewUser()
    {
        // Arrange
        var username = "testuser";
        var password = "password123";
        var email = "test@example.com";

        // Act
        var user = await _userService.CreateUserAsync(username, password, email);

        // Assert
        Assert.NotNull(user);
        Assert.Equal(username, user.Username);
        Assert.Equal(email, user.Email);
        Assert.NotEmpty(user.Id);
    }

    [Fact]
    public async Task CreateUser_ShouldThrowException_WhenUsernameExists()
    {
        // Arrange
        var username = "testuser";
        var password = "password123";
        var email = "test@example.com";

        // Act
        await _userService.CreateUserAsync(username, password, email);

        // Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _userService.CreateUserAsync(username, password, email));
    }

    [Fact]
    public async Task ValidateCredentials_ShouldReturnTrue_WhenCredentialsAreValid()
    {
        // Arrange
        var username = "testuser";
        var password = "password123";
        await _userService.CreateUserAsync(username, password, null);

        // Act
        var result = await _userService.ValidateCredentialsAsync(username, password);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task ValidateCredentials_ShouldReturnFalse_WhenCredentialsAreInvalid()
    {
        // Arrange
        var username = "testuser";
        var password = "password123";
        await _userService.CreateUserAsync(username, password, null);

        // Act
        var result = await _userService.ValidateCredentialsAsync(username, "wrongpassword");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task GenerateJwtToken_ShouldGenerateValidToken()
    {
        // Arrange
        var user = await _userService.CreateUserAsync("testuser", "password123", null);

        // Act
        var token = await _userService.GenerateJwtTokenAsync(user);

        // Assert
        Assert.NotEmpty(token);
    }

    [Fact]
    public async Task UpdateReadingProgress_ShouldUpdateProgress()
    {
        // Arrange
        var user = await _userService.CreateUserAsync("testuser", "password123", null);
        var bookId = "book1";
        var progress = new ReadingProgress
        {
            BookId = bookId,
            ChapterIndex = 1,
            Position = 0.5f
        };

        // Act
        await _userService.UpdateReadingProgressAsync(user.Id, bookId, progress);
        var savedProgress = await _userService.GetReadingProgressAsync(user.Id, bookId);

        // Assert
        Assert.NotNull(savedProgress);
        Assert.Equal(bookId, savedProgress.BookId);
        Assert.Equal(1, savedProgress.ChapterIndex);
        Assert.Equal(0.5f, savedProgress.Position);
    }

    [Fact]
    public async Task AddBookmark_ShouldAddBookmark()
    {
        // Arrange
        var user = await _userService.CreateUserAsync("testuser", "password123", null);
        var bookId = "book1";

        // Act
        await _userService.AddBookmarkAsync(user.Id, bookId);
        var bookmarks = await _userService.GetBookmarksAsync(user.Id);

        // Assert
        Assert.Contains(bookId, bookmarks);
    }

    [Fact]
    public async Task RemoveBookmark_ShouldRemoveBookmark()
    {
        // Arrange
        var user = await _userService.CreateUserAsync("testuser", "password123", null);
        var bookId = "book1";
        await _userService.AddBookmarkAsync(user.Id, bookId);

        // Act
        await _userService.RemoveBookmarkAsync(user.Id, bookId);
        var bookmarks = await _userService.GetBookmarksAsync(user.Id);

        // Assert
        Assert.DoesNotContain(bookId, bookmarks);
    }

    [Fact]
    public async Task UpdateReaderSettings_ShouldUpdateSettings()
    {
        // Arrange
        var user = await _userService.CreateUserAsync("testuser", "password123", null);
        var bookId = "book1";
        var settings = new ReaderSettings
        {
            FontSize = 20,
            Theme = "dark",
            NightMode = true
        };

        // Act
        await _userService.UpdateReaderSettingsAsync(user.Id, bookId, settings);
        var progress = await _userService.GetReadingProgressAsync(user.Id, bookId);

        // Assert
        Assert.NotNull(progress);
        Assert.Equal(20, progress.Settings.FontSize);
        Assert.Equal("dark", progress.Settings.Theme);
        Assert.True(progress.Settings.NightMode);
    }
}
