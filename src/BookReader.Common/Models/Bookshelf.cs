using System;
using System.Collections.Generic;

namespace BookReader.Common.Models
{
    /// <summary>
    /// 书架实体
    /// </summary>
    public class Bookshelf
    {
        /// <summary>
        /// 书架ID
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// 书架名称
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 用户ID
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// 书籍ID列表
        /// </summary>
        public List<string> BookIds { get; set; }

        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreateTime { get; set; }

        /// <summary>
        /// 最后更新时间
        /// </summary>
        public DateTime LastUpdateTime { get; set; }

        /// <summary>
        /// 排序方式（按名称、时间等）
        /// </summary>
        public string SortBy { get; set; }

        /// <summary>
        /// 是否为默认书架
        /// </summary>
        public bool IsDefault { get; set; }
    }
}
