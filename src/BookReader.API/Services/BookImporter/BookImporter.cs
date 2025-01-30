using BookReader.API.Models;
using BookReader.API.Services.BookParser;

namespace BookReader.API.Services.BookImporter;

public class BookImporter : IBookImporter
{
    private readonly IEnumerable<IBookParser> _parsers;
    private readonly ILogger<BookImporter> _logger;

    public BookImporter(IEnumerable<IBookParser> parsers, ILogger<BookImporter> logger)
    {
        _parsers = parsers;
        _logger = logger;
    }

    public async Task<Book> ImportFromFileAsync(IFormFile file)
    {
        // 验证文件
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("文件不能为空");
        }

        // 获取合适的解析器
        var parser = _parsers.FirstOrDefault(p => p.CanParse(file.FileName));
        if (parser == null)
        {
            throw new BookParseException($"不支持的文件类型: {Path.GetExtension(file.FileName)}");
        }

        try
        {
            // 解析文件
            using var stream = file.OpenReadStream();
            var book = await parser.ParseAsync(stream, file.FileName);
            
            // TODO: 保存到数据库
            
            return book;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "导入文件失败: {FileName}", file.FileName);
            throw new BookParseException("导入文件失败", ex);
        }
    }
}
