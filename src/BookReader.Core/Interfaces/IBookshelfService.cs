using System.Collections.Generic;
using System.Threading.Tasks;
using BookReader.Common.Models;

namespace BookReader.Core.Interfaces
{
    /// <summary>
    /// 书架服务接口
    /// </summary>
    public interface IBookshelfService
    {
        /// <summary>
        /// 创建书架
        /// </summary>
        /// <param name="bookshelf">书架信息</param>
        /// <returns>创建的书架</returns>
        Task<Bookshelf> CreateBookshelfAsync(Bookshelf bookshelf);

        /// <summary>
        /// 获取用户的书架列表
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <returns>书架列表</returns>
        Task<List<Bookshelf>> GetUserBookshelvesAsync(string userId);

        /// <summary>
        /// 获取书架中的书籍
        /// </summary>
        /// <param name="bookshelfId">书架ID</param>
        /// <returns>书籍列表</returns>
        Task<List<Book>> GetBooksInBookshelfAsync(string bookshelfId);

        /// <summary>
        /// 添加书籍到书架
        /// </summary>
        /// <param name="bookshelfId">书架ID</param>
        /// <param name="bookId">书籍ID</param>
        /// <returns>添加结果</returns>
        Task<bool> AddBookToBookshelfAsync(string bookshelfId, string bookId);

        /// <summary>
        /// 从书架移除书籍
        /// </summary>
        /// <param name="bookshelfId">书架ID</param>
        /// <param name="bookId">书籍ID</param>
        /// <returns>移除结果</returns>
        Task<bool> RemoveBookFromBookshelfAsync(string bookshelfId, string bookId);

        /// <summary>
        /// 更新书架信息
        /// </summary>
        /// <param name="bookshelf">书架信息</param>
        /// <returns>更新结果</returns>
        Task<bool> UpdateBookshelfAsync(Bookshelf bookshelf);

        /// <summary>
        /// 删除书架
        /// </summary>
        /// <param name="bookshelfId">书架ID</param>
        /// <returns>删除结果</returns>
        Task<bool> DeleteBookshelfAsync(string bookshelfId);

        /// <summary>
        /// 获取默认书架
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <returns>默认书架</returns>
        Task<Bookshelf> GetDefaultBookshelfAsync(string userId);
    }
}
