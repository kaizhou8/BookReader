namespace BookReader.API.Models;

public class ReadingProgress
{
    public string BookId { get; set; } = null!;
    public int ChapterIndex { get; set; }
    public float Position { get; set; }  // 章节内的阅读位置（0-1）
    public DateTime LastReadTime { get; set; }
    public ReaderSettings Settings { get; set; } = new();
}
