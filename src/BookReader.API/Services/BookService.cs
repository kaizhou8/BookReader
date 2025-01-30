using BookReader.API.Models;
using BookReader.API.Services.BookParser;
using System.Collections.Concurrent;

namespace BookReader.API.Services;

public class BookService : IBookService
{
    private readonly ConcurrentDictionary<string, Book> _books = new();
    private readonly IEnumerable<IBookParser> _parsers;
    private readonly ILogger<BookService> _logger;

    public BookService(IEnumerable<IBookParser> parsers, ILogger<BookService> logger)
    {
        _parsers = parsers;
        _logger = logger;
    }

    public Task<IEnumerable<BookInfo>> GetBooksAsync()
    {
        var books = _books.Values.Select(b => new BookInfo
        {
            Id = b.Id,
            Title = b.Title ?? "未知标题",
            Author = b.Author,
            Description = b.Description,
            CoverUrl = b.CoverUrl,
            FileType = b.FileType ?? "unknown",
            ChapterCount = b.Chapters?.Count ?? 0,
            CreateTime = b.CreateTime,
            UpdateTime = b.UpdateTime
        });

        return Task.FromResult(books);
    }

    public Task<Book?> GetBookAsync(string id)
    {
        _books.TryGetValue(id, out var book);
        return Task.FromResult(book);
    }

    public Task<IEnumerable<ChapterInfo>> GetChaptersAsync(string bookId)
    {
        if (!_books.TryGetValue(bookId, out var book))
        {
            return Task.FromResult<IEnumerable<ChapterInfo>>(Array.Empty<ChapterInfo>());
        }

        var chapters = book.Chapters.Select(c => new ChapterInfo
        {
            Title = c.Title ?? $"第{c.Index}章",
            Index = c.Index
        });

        return Task.FromResult(chapters);
    }

    public Task<Chapter?> GetChapterAsync(string bookId, int chapterIndex)
    {
        if (!_books.TryGetValue(bookId, out var book))
        {
            return Task.FromResult<Chapter?>(null);
        }

        var chapter = book.Chapters.FirstOrDefault(c => c.Index == chapterIndex);
        return Task.FromResult(chapter);
    }

    public async Task<Book> ImportBookAsync(Stream stream, string fileName)
    {
        var parser = _parsers.FirstOrDefault(p => p.CanParse(fileName));
        if (parser == null)
        {
            throw new BookParseException($"不支持的文件格式: {Path.GetExtension(fileName)}");
        }

        var book = await parser.ParseAsync(stream, fileName);
        book.Id = Guid.NewGuid().ToString();

        if (!_books.TryAdd(book.Id, book))
        {
            throw new Exception("添加书籍失败");
        }

        return book;
    }
}
