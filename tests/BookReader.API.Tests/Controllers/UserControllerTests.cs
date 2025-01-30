using BookReader.API.Controllers;
using BookReader.API.Models;
using BookReader.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace BookReader.API.Tests.Controllers;

public class UserControllerTests
{
    private readonly Mock<IUserService> _userServiceMock;
    private readonly Mock<ILogger<UserController>> _loggerMock;
    private readonly UserController _controller;

    public UserControllerTests()
    {
        _userServiceMock = new Mock<IUserService>();
        _loggerMock = new Mock<ILogger<UserController>>();
        _controller = new UserController(_userServiceMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Register_ShouldReturnCreatedResult_WhenSuccessful()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Username = "testuser",
            Password = "password123",
            Email = "test@example.com"
        };

        var user = new User
        {
            Id = "1",
            Username = request.Username,
            Email = request.Email
        };

        _userServiceMock.Setup(x => x.CreateUserAsync(request.Username, request.Password, request.Email))
            .ReturnsAsync(user);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returnValue = Assert.IsType<User>(createdAtActionResult.Value);
        Assert.Equal(user.Id, returnValue.Id);
        Assert.Equal(user.Username, returnValue.Username);
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenUserExists()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Username = "testuser",
            Password = "password123",
            Email = "test@example.com"
        };

        _userServiceMock.Setup(x => x.CreateUserAsync(request.Username, request.Password, request.Email))
            .ThrowsAsync(new InvalidOperationException("用户名已存在"));

        // Act
        var result = await _controller.Register(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_ShouldReturnOkResult_WhenCredentialsAreValid()
    {
        // Arrange
        var request = new LoginRequest
        {
            Username = "testuser",
            Password = "password123"
        };

        var user = new User
        {
            Id = "1",
            Username = request.Username
        };

        _userServiceMock.Setup(x => x.ValidateCredentialsAsync(request.Username, request.Password))
            .ReturnsAsync(true);
        _userServiceMock.Setup(x => x.GetUserByUsernameAsync(request.Username))
            .ReturnsAsync(user);
        _userServiceMock.Setup(x => x.GenerateJwtTokenAsync(user))
            .ReturnsAsync("token");

        // Act
        var result = await _controller.Login(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var loginResponse = Assert.IsType<LoginResponse>(okResult.Value);
        Assert.Equal("token", loginResponse.Token);
        Assert.Equal(user.Id, loginResponse.User.Id);
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenCredentialsAreInvalid()
    {
        // Arrange
        var request = new LoginRequest
        {
            Username = "testuser",
            Password = "wrongpassword"
        };

        _userServiceMock.Setup(x => x.ValidateCredentialsAsync(request.Username, request.Password))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.Login(request);

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetUser_ShouldReturnOkResult_WhenUserExists()
    {
        // Arrange
        var userId = "1";
        var user = new User { Id = userId, Username = "testuser" };

        _userServiceMock.Setup(x => x.GetUserAsync(userId))
            .ReturnsAsync(user);

        // Act
        var result = await _controller.GetUser(userId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnValue = Assert.IsType<User>(okResult.Value);
        Assert.Equal(userId, returnValue.Id);
    }

    [Fact]
    public async Task GetUser_ShouldReturnNotFound_WhenUserDoesNotExist()
    {
        // Arrange
        var userId = "1";

        _userServiceMock.Setup(x => x.GetUserAsync(userId))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _controller.GetUser(userId);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task UpdateReadingProgress_ShouldReturnOk_WhenSuccessful()
    {
        // Arrange
        var userId = "1";
        var bookId = "book1";
        var progress = new ReadingProgress
        {
            BookId = bookId,
            ChapterIndex = 1,
            Position = 0.5f
        };

        _userServiceMock.Setup(x => x.UpdateReadingProgressAsync(userId, bookId, progress))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateReadingProgress(userId, bookId, progress);

        // Assert
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public async Task GetReadingProgress_ShouldReturnOkResult_WhenProgressExists()
    {
        // Arrange
        var userId = "1";
        var bookId = "book1";
        var progress = new ReadingProgress
        {
            BookId = bookId,
            ChapterIndex = 1,
            Position = 0.5f
        };

        _userServiceMock.Setup(x => x.GetReadingProgressAsync(userId, bookId))
            .ReturnsAsync(progress);

        // Act
        var result = await _controller.GetReadingProgress(userId, bookId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnValue = Assert.IsType<ReadingProgress>(okResult.Value);
        Assert.Equal(bookId, returnValue.BookId);
        Assert.Equal(1, returnValue.ChapterIndex);
        Assert.Equal(0.5f, returnValue.Position);
    }
}
