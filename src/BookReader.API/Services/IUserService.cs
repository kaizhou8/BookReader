using BookReader.API.Models;

namespace BookReader.API.Services;

public interface IUserService
{
    Task<User?> GetUserAsync(string id);
    Task<User?> GetUserByUsernameAsync(string username);
    Task<User> CreateUserAsync(string username, string password, string? email);
    Task<bool> ValidateCredentialsAsync(string username, string password);
    Task<string> GenerateJwtTokenAsync(User user);
    Task UpdateReadingProgressAsync(string userId, string bookId, ReadingProgress progress);
    Task<ReadingProgress?> GetReadingProgressAsync(string userId, string bookId);
    Task AddBookmarkAsync(string userId, string bookId);
    Task RemoveBookmarkAsync(string userId, string bookId);
    Task<List<string>> GetBookmarksAsync(string userId);
    Task UpdateReaderSettingsAsync(string userId, string bookId, ReaderSettings settings);
}
