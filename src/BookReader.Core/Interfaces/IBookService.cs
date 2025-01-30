using System.Collections.Generic;
using System.Threading.Tasks;
using BookReader.Common.Models;

namespace BookReader.Core.Interfaces
{
    /// <summary>
    /// 书籍服务接口
    /// </summary>
    public interface IBookService
    {
        /// <summary>
        /// 搜索书籍
        /// </summary>
        /// <param name="keyword">关键词</param>
        /// <param name="page">页码</param>
        /// <param name="pageSize">每页数量</param>
        /// <returns>书籍列表</returns>
        Task<List<Book>> SearchBooksAsync(string keyword, int page = 1, int pageSize = 20);

        /// <summary>
        /// 获取书籍详情
        /// </summary>
        /// <param name="bookId">书籍ID</param>
        /// <returns>书籍详情</returns>
        Task<Book> GetBookAsync(string bookId);

        /// <summary>
        /// 导入本地书籍
        /// </summary>
        /// <param name="filePath">文件路径</param>
        /// <returns>导入的书籍</returns>
        Task<Book> ImportLocalBookAsync(string filePath);

        /// <summary>
        /// 获取推荐书籍
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="count">数量</param>
        /// <returns>推荐书籍列表</returns>
        Task<List<Book>> GetRecommendedBooksAsync(string userId, int count = 10);

        /// <summary>
        /// 获取书籍章节列表
        /// </summary>
        /// <param name="bookId">书籍ID</param>
        /// <returns>章节列表</returns>
        Task<List<string>> GetBookChaptersAsync(string bookId);

        /// <summary>
        /// 获取章节内容
        /// </summary>
        /// <param name="bookId">书籍ID</param>
        /// <param name="chapterIndex">章节索引</param>
        /// <returns>章节内容</returns>
        Task<string> GetChapterContentAsync(string bookId, int chapterIndex);

        /// <summary>
        /// 更新阅读进度
        /// </summary>
        /// <param name="progress">阅读进度</param>
        /// <returns>更新结果</returns>
        Task<bool> UpdateReadingProgressAsync(BookProgress progress);

        /// <summary>
        /// 获取阅读进度
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="bookId">书籍ID</param>
        /// <returns>阅读进度</returns>
        Task<BookProgress> GetReadingProgressAsync(string userId, string bookId);
    }
}
