using BookReader.API.Models;
using BookReader.API.Services;
using BookReader.API.Services.BookParser;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace BookReader.API.Tests.Services;

public class BookServiceTests
{
    private readonly Mock<ILogger<BookService>> _loggerMock;
    private readonly Mock<IBookParser> _parserMock;
    private readonly BookService _service;

    public BookServiceTests()
    {
        _loggerMock = new Mock<ILogger<BookService>>();
        _parserMock = new Mock<IBookParser>();
        _service = new BookService(new[] { _parserMock.Object }, _loggerMock.Object);
    }

    [Fact]
    public async Task ImportBookAsync_ShouldReturnBook_WhenParserSucceeds()
    {
        // Arrange
        var fileName = "test.epub";
        var stream = new MemoryStream();
        var book = new Book
        {
            Title = "Test Book",
            Author = "Test Author",
            Chapters = new List<Chapter>
            {
                new Chapter { Title = "Chapter 1", Content = "Content 1", Index = 1 }
            }
        };

        _parserMock.Setup(p => p.CanParse(fileName)).Returns(true);
        _parserMock.Setup(p => p.ParseAsync(stream, fileName)).ReturnsAsync(book);

        // Act
        var result = await _service.ImportBookAsync(stream, fileName);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(book.Title, result.Title);
        Assert.Equal(book.Author, result.Author);
        Assert.Single(result.Chapters);
        Assert.NotNull(result.Id);
    }

    [Fact]
    public async Task GetChapterAsync_ShouldReturnChapter_WhenBookAndChapterExist()
    {
        // Arrange
        var book = new Book
        {
            Title = "Test Book",
            Author = "Test Author",
            Chapters = new List<Chapter>
            {
                new Chapter { Title = "Chapter 1", Content = "Content 1", Index = 1 }
            }
        };

        _parserMock.Setup(p => p.CanParse(It.IsAny<string>())).Returns(true);
        _parserMock.Setup(p => p.ParseAsync(It.IsAny<Stream>(), It.IsAny<string>())).ReturnsAsync(book);

        var importedBook = await _service.ImportBookAsync(new MemoryStream(), "test.epub");

        // Act
        var chapter = await _service.GetChapterAsync(importedBook.Id, 1);

        // Assert
        Assert.NotNull(chapter);
        Assert.Equal("Chapter 1", chapter.Title);
        Assert.Equal("Content 1", chapter.Content);
        Assert.Equal(1, chapter.Index);
    }

    [Fact]
    public async Task GetChapterAsync_ShouldReturnNull_WhenBookDoesNotExist()
    {
        // Act
        var chapter = await _service.GetChapterAsync("nonexistent", 1);

        // Assert
        Assert.Null(chapter);
    }

    [Fact]
    public async Task GetChapterAsync_ShouldReturnNull_WhenChapterDoesNotExist()
    {
        // Arrange
        var book = new Book
        {
            Title = "Test Book",
            Author = "Test Author",
            Chapters = new List<Chapter>
            {
                new Chapter { Title = "Chapter 1", Content = "Content 1", Index = 1 }
            }
        };

        _parserMock.Setup(p => p.CanParse(It.IsAny<string>())).Returns(true);
        _parserMock.Setup(p => p.ParseAsync(It.IsAny<Stream>(), It.IsAny<string>())).ReturnsAsync(book);

        var importedBook = await _service.ImportBookAsync(new MemoryStream(), "test.epub");

        // Act
        var chapter = await _service.GetChapterAsync(importedBook.Id, 999);

        // Assert
        Assert.Null(chapter);
    }
}
