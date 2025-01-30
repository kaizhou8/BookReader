using BookReader.API.Services.BookParser;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using System.Net;
using System.Text;
using Xunit;

namespace BookReader.API.Tests.Services.BookParser;

public class WebBookParserTests
{
    private readonly Mock<ILogger<WebBookParser>> _loggerMock;
    private readonly Mock<HttpMessageHandler> _handlerMock;
    private readonly HttpClient _httpClient;
    private readonly WebBookParser _parser;

    public WebBookParserTests()
    {
        _loggerMock = new Mock<ILogger<WebBookParser>>();
        _handlerMock = new Mock<HttpMessageHandler>();
        _httpClient = new HttpClient(_handlerMock.Object);
        _parser = new WebBookParser(_loggerMock.Object, _httpClient);
    }

    [Theory]
    [InlineData("http://example.com")]
    [InlineData("https://example.com")]
    public void CanParse_ShouldReturnTrue_ForValidUrls(string url)
    {
        // Act
        var result = _parser.CanParse(url);

        // Assert
        Assert.True(result);
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-a-url")]
    [InlineData("file:///c:/test.txt")]
    public void CanParse_ShouldReturnFalse_ForInvalidUrls(string url)
    {
        // Act
        var result = _parser.CanParse(url);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task ParseAsync_ShouldReturnBook_WhenHtmlIsValid()
    {
        // Arrange
        var html = @"
            <html>
                <head>
                    <title>Test Book</title>
                    <meta name='author' content='Test Author'>
                    <meta name='description' content='Test Description'>
                </head>
                <body>
                    <article>
                        <h1>Chapter 1</h1>
                        <p>This is the content of chapter 1.</p>
                    </article>
                </body>
            </html>";

        var stream = new MemoryStream(Encoding.UTF8.GetBytes(html));
        var url = "https://example.com/book";

        // Act
        var book = await _parser.ParseAsync(stream, url);

        // Assert
        Assert.NotNull(book);
        Assert.Equal("Test Book", book.Title);
        Assert.Equal("Test Author", book.Author);
        Assert.Equal("Test Description", book.Description);
        Assert.Equal("web", book.FileType);
        Assert.NotEmpty(book.Chapters);
    }

    [Fact]
    public async Task ParseAsync_ShouldReturnBook_WhenHtmlHasNoMetadata()
    {
        // Arrange
        var html = @"
            <html>
                <body>
                    <div class='content'>
                        <p>This is some content.</p>
                    </div>
                </body>
            </html>";

        var stream = new MemoryStream(Encoding.UTF8.GetBytes(html));
        var url = "https://example.com/book";

        // Act
        var book = await _parser.ParseAsync(stream, url);

        // Assert
        Assert.NotNull(book);
        Assert.Equal("未知标题", book.Title);
        Assert.Null(book.Author);
        Assert.Null(book.Description);
        Assert.Equal("web", book.FileType);
        Assert.NotEmpty(book.Chapters);
    }

    [Fact]
    public async Task ParseAsync_ShouldThrowException_WhenHtmlIsInvalid()
    {
        // Arrange
        var html = "This is not valid HTML";
        var stream = new MemoryStream(Encoding.UTF8.GetBytes(html));
        var url = "https://example.com/book";

        // Act & Assert
        await Assert.ThrowsAsync<BookParseException>(() => _parser.ParseAsync(stream, url));
    }
}
