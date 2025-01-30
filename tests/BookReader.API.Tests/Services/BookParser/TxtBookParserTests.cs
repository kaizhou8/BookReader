using System.Text;
using BookReader.API.Services.BookParser;
using Microsoft.Extensions.Logging;
using Xunit;

namespace BookReader.API.Tests.Services.BookParser;

public class TxtBookParserTests
{
    private readonly ILogger<TxtBookParser> _logger;
    private readonly TxtBookParser _parser;

    public TxtBookParserTests()
    {
        _logger = new LoggerFactory().CreateLogger<TxtBookParser>();
        _parser = new TxtBookParser(_logger);
    }

    [Fact]
    public void CanParse_WithTxtFile_ReturnsTrue()
    {
        // Arrange
        var fileName = "test.txt";

        // Act
        var result = _parser.CanParse(fileName);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void CanParse_WithNonTxtFile_ReturnsFalse()
    {
        // Arrange
        var fileName = "test.pdf";

        // Act
        var result = _parser.CanParse(fileName);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task ParseAsync_WithValidContent_ReturnsBook()
    {
        // Arrange
        var content = @"第一章 测试章节
这是第一章的内容。

第二章 另一个章节
这是第二章的内容。";

        var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
        var fileName = "test.txt";

        // Act
        var book = await _parser.ParseAsync(stream, fileName);

        // Assert
        Assert.NotNull(book);
        Assert.Equal("test", book.Title);
        Assert.Equal(2, book.Chapters.Count);
        Assert.Equal("第一章 测试章节", book.Chapters[0].Title);
        Assert.Equal("这是第一章的内容。", book.Chapters[0].Content.Trim());
        Assert.Equal("第二章 另一个章节", book.Chapters[1].Title);
        Assert.Equal("这是第二章的内容。", book.Chapters[1].Content.Trim());
    }

    [Fact]
    public async Task ParseAsync_WithNoChapters_CreatesSingleChapter()
    {
        // Arrange
        var content = "这是一个没有章节的文本内容。";
        var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
        var fileName = "test.txt";

        // Act
        var book = await _parser.ParseAsync(stream, fileName);

        // Assert
        Assert.NotNull(book);
        Assert.Single(book.Chapters);
        Assert.Equal("第1章", book.Chapters[0].Title);
        Assert.Equal(content, book.Chapters[0].Content.Trim());
    }

    [Fact]
    public async Task ParseAsync_WithEmptyContent_ThrowsException()
    {
        // Arrange
        var stream = new MemoryStream(Array.Empty<byte>());
        var fileName = "test.txt";

        // Act & Assert
        await Assert.ThrowsAsync<BookParseException>(() => _parser.ParseAsync(stream, fileName));
    }
}
