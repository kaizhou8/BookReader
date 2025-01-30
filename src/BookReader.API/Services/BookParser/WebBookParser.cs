using System.Text;
using System.Text.RegularExpressions;
using BookReader.API.Models;
using HtmlAgilityPack;
using Microsoft.Extensions.Logging;

namespace BookReader.API.Services.BookParser;

public class WebBookParser : IBookParser
{
    private readonly ILogger<WebBookParser> _logger;
    private readonly HttpClient _httpClient;

    public WebBookParser(ILogger<WebBookParser> logger, HttpClient httpClient)
    {
        _logger = logger;
        _httpClient = httpClient;
    }

    public bool CanParse(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }

    public async Task<Book> ParseAsync(Stream stream, string url)
    {
        try
        {
            using var reader = new StreamReader(stream);
            var html = await reader.ReadToEndAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // 验证 HTML 结构
            if (doc.DocumentNode.SelectNodes("//body") == null)
            {
                throw new BookParseException("无效的 HTML 格式");
            }

            // 尝试获取标题
            var title = doc.DocumentNode.SelectSingleNode("//title")?.InnerText?.Trim()
                ?? doc.DocumentNode.SelectSingleNode("//h1")?.InnerText?.Trim()
                ?? "未知标题";

            // 尝试获取作者
            var author = doc.DocumentNode.SelectSingleNode("//meta[@name='author']")?.GetAttributeValue("content", null)
                ?? doc.DocumentNode.SelectSingleNode("//*[contains(@class, 'author')]")?.InnerText?.Trim();

            // 尝试获取描述
            var description = doc.DocumentNode.SelectSingleNode("//meta[@name='description']")?.GetAttributeValue("content", null)
                ?? doc.DocumentNode.SelectSingleNode("//meta[@property='og:description']")?.GetAttributeValue("content", null);

            // 创建书籍对象
            var book = new Book
            {
                Id = Guid.NewGuid().ToString(),
                Title = title,
                Author = author,
                Description = description,
                FileName = url,
                FileType = "web",
                CreateTime = DateTime.UtcNow,
                UpdateTime = DateTime.UtcNow,
                Chapters = new List<Chapter>()
            };

            // 尝试分章节
            var chapters = await ParseChaptersAsync(doc, url);
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
        catch (Exception ex) when (ex is not BookParseException)
        {
            _logger.LogError(ex, "解析网页失败: {Url}", url);
            throw new BookParseException("解析网页失败", ex);
        }
    }

    private async Task<List<(string Title, string Content)>> ParseChaptersAsync(HtmlDocument doc, string baseUrl)
    {
        var chapters = new List<(string Title, string Content)>();

        // 尝试查找可能的章节链接
        var links = doc.DocumentNode.SelectNodes("//a[contains(@href, 'chapter') or contains(@title, '章') or contains(text(), '章')]");
        if (links != null && links.Count > 0)
        {
            // 如果找到章节链接，则逐个获取章节内容
            foreach (var link in links)
            {
                var href = link.GetAttributeValue("href", "");
                if (string.IsNullOrEmpty(href)) continue;

                var absoluteUrl = GetAbsoluteUrl(baseUrl, href);
                if (string.IsNullOrEmpty(absoluteUrl)) continue;

                try
                {
                    var response = await _httpClient.GetStringAsync(absoluteUrl);
                    var chapterDoc = new HtmlDocument();
                    chapterDoc.LoadHtml(response);

                    var title = link.InnerText.Trim();
                    var content = ExtractMainContent(chapterDoc);

                    if (!string.IsNullOrEmpty(content))
                    {
                        chapters.Add((title, content));
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "获取章节内容失败: {Url}", absoluteUrl);
                }
            }
        }
        else
        {
            // 如果没有找到章节链接，则尝试直接从当前页面提取内容
            var content = ExtractMainContent(doc);
            if (!string.IsNullOrEmpty(content))
            {
                chapters.Add(("第1章", content));
            }
        }

        return chapters;
    }

    private string ExtractMainContent(HtmlDocument doc)
    {
        // 尝试查找主要内容区域
        var contentNode = doc.DocumentNode.SelectSingleNode("//article")
            ?? doc.DocumentNode.SelectSingleNode("//*[contains(@class, 'content')]")
            ?? doc.DocumentNode.SelectSingleNode("//*[contains(@class, 'article')]")
            ?? doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'main')]");

        if (contentNode == null)
        {
            // 如果找不到特定的内容区域，尝试使用启发式方法找到最可能的内容区域
            var textNodes = doc.DocumentNode.SelectNodes("//div[string-length(text()) > 500]");
            if (textNodes != null)
            {
                contentNode = textNodes.OrderByDescending(n => n.InnerText.Length).FirstOrDefault();
            }
        }

        if (contentNode != null)
        {
            // 清理内容
            var content = contentNode.InnerText;
            content = Regex.Replace(content, @"\s+", " "); // 合并空白字符
            content = content.Trim();
            return content;
        }

        return string.Empty;
    }

    private string GetAbsoluteUrl(string baseUrl, string relativeUrl)
    {
        try
        {
            var baseUri = new Uri(baseUrl);
            var absoluteUri = new Uri(baseUri, relativeUrl);
            return absoluteUri.ToString();
        }
        catch
        {
            return string.Empty;
        }
    }
}
