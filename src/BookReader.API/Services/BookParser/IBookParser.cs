using BookReader.API.Models;

namespace BookReader.API.Services.BookParser;

public interface IBookParser
{
    /// <summary>
    /// 检查是否支持该文件类型
    /// </summary>
    bool CanParse(string fileName);

    /// <summary>
    /// 解析书籍内容
    /// </summary>
    Task<Book> ParseAsync(Stream stream, string fileName);
}
