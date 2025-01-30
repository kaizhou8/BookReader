using System.Threading.Tasks;
using BookReader.Common.Models;

namespace BookReader.Core.Interfaces
{
    /// <summary>
    /// 用户服务接口
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// 用户注册
        /// </summary>
        /// <param name="user">用户信息</param>
        /// <returns>注册结果</returns>
        Task<User> RegisterAsync(User user);

        /// <summary>
        /// 用户登录
        /// </summary>
        /// <param name="username">用户名</param>
        /// <param name="password">密码</param>
        /// <returns>登录用户信息</returns>
        Task<User> LoginAsync(string username, string password);

        /// <summary>
        /// 更新用户信息
        /// </summary>
        /// <param name="user">用户信息</param>
        /// <returns>更新结果</returns>
        Task<bool> UpdateUserAsync(User user);

        /// <summary>
        /// 获取用户信息
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <returns>用户信息</returns>
        Task<User> GetUserAsync(string userId);

        /// <summary>
        /// 更新阅读偏好
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="preferences">阅读偏好设置</param>
        /// <returns>更新结果</returns>
        Task<bool> UpdateReadingPreferencesAsync(string userId, string preferences);

        /// <summary>
        /// 添加收藏书籍
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="bookId">书籍ID</param>
        /// <returns>添加结果</returns>
        Task<bool> AddFavoriteBookAsync(string userId, string bookId);

        /// <summary>
        /// 移除收藏书籍
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="bookId">书籍ID</param>
        /// <returns>移除结果</returns>
        Task<bool> RemoveFavoriteBookAsync(string userId, string bookId);
    }
}
