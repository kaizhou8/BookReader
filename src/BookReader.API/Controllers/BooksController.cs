using BookReader.API.Models;
using BookReader.API.Services.BookImporter;
using Microsoft.AspNetCore.Mvc;

namespace BookReader.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookImporter _bookImporter;
    private readonly ILogger<BooksController> _logger;

    public BooksController(IBookImporter bookImporter, ILogger<BooksController> logger)
    {
        _bookImporter = bookImporter;
        _logger = logger;
    }

    [HttpPost("import/file")]
    public async Task<IActionResult> ImportFromFile(IFormFile file)
    {
        try
        {
            var book = await _bookImporter.ImportFromFileAsync(file);
            return Ok(new { success = true, data = book });
        }
        catch (BookParseException ex)
        {
            _logger.LogError(ex, "导入文件失败");
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "导入文件时发生未知错误");
            return StatusCode(500, new { success = false, message = "导入失败，请稍后重试" });
        }
    }
}
