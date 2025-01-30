using BookReader.API.Services.BookParser;
using Microsoft.Extensions.Logging;
using Xunit;

namespace BookReader.API.Tests.Services.BookParser;

public class EpubBookParserTests
{
    private readonly ILogger<EpubBookParser> _logger;
    private readonly EpubBookParser _parser;

    public EpubBookParserTests()
    {
        _logger = new LoggerFactory().CreateLogger<EpubBookParser>();
        _parser = new EpubBookParser(_logger);
    }

    [Fact]
    public void CanParse_WithEpubFile_ReturnsTrue()
    {
        // Arrange
        var fileName = "test.epub";

        // Act
        var result = _parser.CanParse(fileName);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void CanParse_WithNonEpubFile_ReturnsFalse()
    {
        // Arrange
        var fileName = "test.pdf";

        // Act
        var result = _parser.CanParse(fileName);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task ParseAsync_WithEmptyContent_ThrowsException()
    {
        // Arrange
        var stream = new MemoryStream(Array.Empty<byte>());
        var fileName = "test.epub";

        // Act & Assert
        await Assert.ThrowsAsync<BookParseException>(() => _parser.ParseAsync(stream, fileName));
    }
}
