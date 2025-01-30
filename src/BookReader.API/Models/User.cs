namespace BookReader.API.Models;

public class User
{
    public string Id { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string? Email { get; set; }
    public DateTime CreateTime { get; set; }
    public DateTime UpdateTime { get; set; }
    public List<string> BookmarkIds { get; set; } = new();
    public Dictionary<string, ReadingProgress> ReadingProgresses { get; set; } = new();
}
