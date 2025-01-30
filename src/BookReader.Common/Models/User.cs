using System;
using System.Collections.Generic;

namespace BookReader.Common.Models
{
    /// <summary>
    /// 用户实体
    /// </summary>
    public class User
    {
        /// <summary>
        /// 用户ID
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// 用户名
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// 密码哈希
        /// </summary>
        public string PasswordHash { get; set; }

        /// <summary>
        /// 邮箱
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// 头像URL
        /// </summary>
        public string AvatarUrl { get; set; }

        /// <summary>
        /// 注册时间
        /// </summary>
        public DateTime RegisterTime { get; set; }

        /// <summary>
        /// 最后登录时间
        /// </summary>
        public DateTime LastLoginTime { get; set; }

        /// <summary>
        /// 阅读偏好设置（JSON格式）
        /// </summary>
        public string ReadingPreferences { get; set; }

        /// <summary>
        /// 书架ID列表
        /// </summary>
        public List<string> BookshelfIds { get; set; }

        /// <summary>
        /// 收藏的书籍ID列表
        /// </summary>
        public List<string> FavoriteBookIds { get; set; }
    }
}
