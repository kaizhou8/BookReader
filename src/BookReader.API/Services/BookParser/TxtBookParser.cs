using System.Text;
using BookReader.API.Models;

namespace BookReader.API.Services.BookParser;

public class TxtBookParser : IBookParser
{
    private readonly ILogger<TxtBookParser> _logger;

    public TxtBookParser(ILogger<TxtBookParser> logger)
    {
        _logger = logger;
    }

    public bool CanParse(string fileName)
    {
        return Path.GetExtension(fileName).Equals(".txt", StringComparison.OrdinalIgnoreCase);
    }

    public async Task<Book> ParseAsync(Stream stream, string fileName)
    {
        try
        {
            // 检查流是否为空
            if (stream == null || stream.Length == 0)
            {
                throw new BookParseException("文件内容为空");
            }

            // 创建书籍对象
            var book = new Book
            {
                Title = Path.GetFileNameWithoutExtension(fileName),
                FileName = fileName,
                FileType = "txt",
                CreateTime = DateTime.UtcNow,
                UpdateTime = DateTime.UtcNow,
                Chapters = new List<Chapter>()
            };

            using var reader = new StreamReader(stream, Encoding.UTF8);
            var content = await reader.ReadToEndAsync();

            // 检查内容是否为空
            if (string.IsNullOrWhiteSpace(content))
            {
                throw new BookParseException("文件内容为空");
            }

            // 按章节分割内容
            var chapters = SplitChapters(content);

            // 添加章节
            for (int i = 0; i < chapters.Count; i++)
            {
                book.Chapters.Add(new Chapter
                {
                    Title = chapters[i].Title,
                    Content = chapters[i].Content,
                    Index = i + 1,
                    CreateTime = DateTime.UtcNow
                });
            }

            return book;
        }
        catch (BookParseException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "解析TXT文件失败: {FileName}", fileName);
            throw new BookParseException("解析TXT文件失败", ex);
        }
    }

    private List<(string Title, string Content)> SplitChapters(string content)
    {
        var chapters = new List<(string Title, string Content)>();
        var lines = content.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);

        string currentTitle = "第1章";
        var currentContent = new StringBuilder();
        var chapterPattern = @"^第[0-9零一二三四五六七八九十百千万]+章.*$";

        foreach (var line in lines)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;

            // 检查是否是新章节
            if (System.Text.RegularExpressions.Regex.IsMatch(line.Trim(), chapterPattern))
            {
                // 保存当前章节
                if (currentContent.Length > 0)
                {
                    chapters.Add((currentTitle, currentContent.ToString().Trim()));
                    currentContent.Clear();
                }
                currentTitle = line.Trim();
            }
            else
            {
                currentContent.AppendLine(line.Trim());
            }
        }

        // 添加最后一章
        if (currentContent.Length > 0)
        {
            chapters.Add((currentTitle, currentContent.ToString().Trim()));
        }

        // 如果没有找到任何章节，就把整个内容作为一章
        if (chapters.Count == 0)
        {
            chapters.Add(("第1章", content.Trim()));
        }

        return chapters;
    }
}
