using Microsoft.AspNetCore.Mvc;
using BookReader.API.Models;
using BookReader.API.Services;

namespace BookReader.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookController : ControllerBase
{
    private readonly IBookService _bookService;
    private readonly ILogger<BookController> _logger;
    private readonly HttpClient _httpClient;

    public BookController(IBookService bookService, ILogger<BookController> logger, HttpClient httpClient)
    {
        _bookService = bookService;
        _logger = logger;
        _httpClient = httpClient;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookInfo>>> GetBooks()
    {
        try
        {
            var books = await _bookService.GetBooksAsync();
            return Ok(books);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取书籍列表失败");
            return StatusCode(500, "获取书籍列表失败");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Book>> GetBook(string id)
    {
        try
        {
            var book = await _bookService.GetBookAsync(id);
            if (book == null)
            {
                return NotFound();
            }
            return Ok(book);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取书籍失败，ID: {Id}", id);
            return StatusCode(500, "获取书籍失败");
        }
    }

    [HttpGet("{id}/chapters")]
    public async Task<ActionResult<IEnumerable<ChapterInfo>>> GetChapters(string id)
    {
        try
        {
            var chapters = await _bookService.GetChaptersAsync(id);
            return Ok(chapters);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取章节列表失败，BookId: {Id}", id);
            return StatusCode(500, "获取章节列表失败");
        }
    }

    [HttpGet("{id}/chapters/{chapterIndex}")]
    public async Task<ActionResult<Chapter>> GetChapter(string id, int chapterIndex)
    {
        try
        {
            var chapter = await _bookService.GetChapterAsync(id, chapterIndex);
            if (chapter == null)
            {
                return NotFound();
            }
            return Ok(chapter);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取章节内容失败，BookId: {Id}, ChapterIndex: {Index}", id, chapterIndex);
            return StatusCode(500, "获取章节内容失败");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Book>> UploadBook(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("请选择要上传的文件");
        }

        try
        {
            using var stream = file.OpenReadStream();
            var book = await _bookService.ImportBookAsync(stream, file.FileName);
            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
        }
        catch (BookParseException ex)
        {
            _logger.LogError(ex, "解析书籍失败: {FileName}", file.FileName);
            return BadRequest($"解析书籍失败: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "上传书籍失败: {FileName}", file.FileName);
            return StatusCode(500, "上传书籍失败");
        }
    }

    [HttpPost("import")]
    public async Task<ActionResult<Book>> ImportFromUrl([FromBody] ImportUrlRequest request)
    {
        if (string.IsNullOrEmpty(request.Url))
        {
            return BadRequest("请提供要导入的网址");
        }

        if (!Uri.TryCreate(request.Url, UriKind.Absolute, out var uri))
        {
            return BadRequest("无效的网址格式");
        }

        try
        {
            var response = await _httpClient.GetAsync(uri);
            response.EnsureSuccessStatusCode();

            using var stream = await response.Content.ReadAsStreamAsync();
            var book = await _bookService.ImportBookAsync(stream, uri.ToString());
            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "获取网页内容失败: {Url}", request.Url);
            return BadRequest($"获取网页内容失败: {ex.Message}");
        }
        catch (BookParseException ex)
        {
            _logger.LogError(ex, "解析网页内容失败: {Url}", request.Url);
            return BadRequest($"解析网页内容失败: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "导入网页失败: {Url}", request.Url);
            return StatusCode(500, "导入网页失败");
        }
    }
}
