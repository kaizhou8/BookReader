using BookReader.API.Models;

namespace BookReader.API.Services;

public interface IBookService
{
    Task<IEnumerable<BookInfo>> GetBooksAsync();
    Task<Book?> GetBookAsync(string id);
    Task<IEnumerable<ChapterInfo>> GetChaptersAsync(string bookId);
    Task<Chapter?> GetChapterAsync(string bookId, int chapterIndex);
    Task<Book> ImportBookAsync(Stream stream, string fileName);
}
