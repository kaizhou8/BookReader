using System;
using System.Collections.Generic;

namespace BookReader.Common.Models
{
    /// <summary>
    /// 书籍实体
    /// </summary>
    public class Book
    {
        /// <summary>
        /// 书籍ID
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// 书名
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// 作者
        /// </summary>
        public string Author { get; set; }

        /// <summary>
        /// 封面图片URL
        /// </summary>
        public string CoverUrl { get; set; }

        /// <summary>
        /// 简介
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 分类
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// 标签
        /// </summary>
        public List<string> Tags { get; set; }

        /// <summary>
        /// 文件格式（txt、epub、pdf）
        /// </summary>
        public string Format { get; set; }

        /// <summary>
        /// 文件大小（字节）
        /// </summary>
        public long FileSize { get; set; }

        /// <summary>
        /// 字数
        /// </summary>
        public int WordCount { get; set; }

        /// <summary>
        /// 最后更新时间
        /// </summary>
        public DateTime LastUpdateTime { get; set; }

        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreateTime { get; set; }

        /// <summary>
        /// 来源URL（在线书籍）
        /// </summary>
        public string SourceUrl { get; set; }

        /// <summary>
        /// 本地文件路径（本地导入书籍）
        /// </summary>
        public string LocalPath { get; set; }

        /// <summary>
        /// 是否为本地书籍
        /// </summary>
        public bool IsLocal { get; set; }
    }
}
