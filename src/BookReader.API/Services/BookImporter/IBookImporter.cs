using BookReader.API.Models;

namespace BookReader.API.Services.BookImporter;

public interface IBookImporter
{
    /// <summary>
    /// 从文件导入书籍
    /// </summary>
    Task<Book> ImportFromFileAsync(IFormFile file);
}
