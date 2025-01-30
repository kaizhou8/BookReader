using System;

namespace BookReader.Common.Models
{
    /// <summary>
    /// 阅读进度实体
    /// </summary>
    public class BookProgress
    {
        /// <summary>
        /// 进度ID
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// 书籍ID
        /// </summary>
        public string BookId { get; set; }

        /// <summary>
        /// 用户ID
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// 当前章节
        /// </summary>
        public string CurrentChapter { get; set; }

        /// <summary>
        /// 当前位置（百分比）
        /// </summary>
        public double Progress { get; set; }

        /// <summary>
        /// 最后阅读时间
        /// </summary>
        public DateTime LastReadTime { get; set; }

        /// <summary>
        /// 阅读时长（分钟）
        /// </summary>
        public int ReadingDuration { get; set; }

        /// <summary>
        /// 书签列表（JSON格式）
        /// </summary>
        public string Bookmarks { get; set; }

        /// <summary>
        /// 笔记列表（JSON格式）
        /// </summary>
        public string Notes { get; set; }
    }
}
