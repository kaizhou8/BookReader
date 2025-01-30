using VersOne.Epub;
using VersOne.Epub.Schema;
using BookReader.API.Models;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using Microsoft.Extensions.Logging;

namespace BookReader.API.Services.BookParser;

public class EpubBookParser : IBookParser
{
    private readonly ILogger<EpubBookParser> _logger;

    public EpubBookParser(ILogger<EpubBookParser> logger)
    {
        _logger = logger;
    }

    public bool CanParse(string fileName)
    {
        return Path.GetExtension(fileName).Equals(".epub", StringComparison.OrdinalIgnoreCase);
    }

    public async Task<Book> ParseAsync(Stream stream, string fileName)
    {
        try
        {
            // 创建临时文件
            var tempFile = Path.GetTempFileName();
            try
            {
                // 将流写入临时文件
                using (var fileStream = File.Create(tempFile))
                {
                    await stream.CopyToAsync(fileStream);
                }

                // 解析 EPUB 文件
                var epubBook = await EpubReader.ReadBookAsync(tempFile);

                // 创建书籍对象
                var book = new Book
                {
                    Title = epubBook.Title ?? Path.GetFileNameWithoutExtension(fileName),
                    Author = epubBook.Author != null ? string.Join(", ", epubBook.Author) : null,
                    Description = epubBook.Description,
                    FileName = fileName,
                    FileType = "epub",
                    CreateTime = DateTime.UtcNow,
                    UpdateTime = DateTime.UtcNow,
                    Chapters = new List<Chapter>()
                };

                // 获取封面图片
                if (epubBook.CoverImage != null)
                {
                    // TODO: 保存封面图片并设置 CoverUrl
                }

                // 解析章节
                var chapters = await ParseChaptersAsync(epubBook);
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
            finally
            {
                // 清理临时文件
                if (File.Exists(tempFile))
                {
                    File.Delete(tempFile);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "解析EPUB文件失败: {FileName}", fileName);
            throw new BookParseException("解析EPUB文件失败", ex);
        }
    }

    private async Task<List<(string Title, string Content)>> ParseChaptersAsync(EpubBook epubBook)
    {
        var chapters = new List<(string Title, string Content)>();

        // 获取所有内容文件
        var contentFiles = epubBook.ReadingOrder;

        if (contentFiles.Count == 0)
        {
            throw new BookParseException("EPUB文件没有内容");
        }

        // 获取导航点
        var navPoints = GetFlattenedNavigation(epubBook.Navigation ?? new List<EpubNavigationItem>());

        if (navPoints.Count == 0)
        {
            // 如果没有导航信息，就把每个内容文件作为一个章节
            for (int i = 0; i < contentFiles.Count; i++)
            {
                var content = await ReadContentAsync(contentFiles[i]);
                var title = $"第{i + 1}章";
                chapters.Add((title, CleanHtml(content)));
            }
        }
        else
        {
            // 使用导航信息来分章节
            foreach (var navPoint in navPoints.Where(x => x.Link != null))
            {
                var contentFile = contentFiles.FirstOrDefault(x => 
                    x.FilePath.EndsWith(navPoint.Link?.ContentFilePath ?? "", StringComparison.OrdinalIgnoreCase));
                
                if (contentFile != null)
                {
                    var content = await ReadContentAsync(contentFile);
                    chapters.Add((navPoint.Title, CleanHtml(content)));
                }
            }
        }

        return chapters;
    }

    private async Task<string> ReadContentAsync(EpubLocalTextContentFile contentFile)
    {
        var stream = contentFile.Content;
        if (stream == null)
        {
            throw new BookParseException("无法读取EPUB文件内容");
        }

        using var reader = new StreamReader(stream, Encoding.UTF8);
        return await reader.ReadToEndAsync();
    }

    private List<EpubNavigationItem> GetFlattenedNavigation(List<EpubNavigationItem> items)
    {
        var result = new List<EpubNavigationItem>();
        
        foreach (var item in items)
        {
            result.Add(item);
            if (item.NestedItems != null && item.NestedItems.Any())
            {
                result.AddRange(GetFlattenedNavigation(item.NestedItems));
            }
        }
        
        return result;
    }

    private string CleanHtml(string html)
    {
        // 移除 HTML 标签
        var text = System.Text.RegularExpressions.Regex.Replace(html, "<[^>]+>", string.Empty);
        
        // 解码 HTML 实体
        text = WebUtility.HtmlDecode(text);
        
        // 移除多余的空白字符
        text = System.Text.RegularExpressions.Regex.Replace(text, @"\s+", " ");
        
        return text.Trim();
    }
}
