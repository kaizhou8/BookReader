namespace BookReader.API.Models;

public class BookInfo
{
    public required string Id { get; set; }
    public required string Title { get; set; }
    public string? Author { get; set; }
    public string? Description { get; set; }
    public string? CoverUrl { get; set; }
    public required string FileType { get; set; }
    public int ChapterCount { get; set; }
    public DateTime CreateTime { get; set; }
    public DateTime UpdateTime { get; set; }
}
