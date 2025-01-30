using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using BookReader.Core.Interfaces;
using BookReader.Common.Models;
using Ude; // 使用Mozilla的Universal Detector Engine进行编码检测

namespace BookReader.Core.Services
{
    /// <summary>
    /// 文件服务实现
    /// </summary>
    public class FileService : IFileService
    {
        private readonly IBookService _bookService;

        public FileService(IBookService bookService)
        {
            _bookService = bookService;
        }

        /// <summary>
        /// 检测文本文件编码
        /// </summary>
        public async Task<string> DetectFileEncodingAsync(string filePath)
        {
            using var fs = File.OpenRead(filePath);
            var detector = new CharsetDetector();
            detector.Feed(fs);
            detector.DataEnd();

            if (detector.Charset != null)
            {
                return detector.Charset;
            }

            // 如果检测失败，尝试常见的编码
            var encodings = new[] { "GB18030", "GBK", "GB2312", "UTF-8", "UTF-16" };
            foreach (var encoding in encodings)
            {
                try
                {
                    using var reader = new StreamReader(filePath, Encoding.GetEncoding(encoding));
                    await reader.ReadToEndAsync();
                    return encoding;
                }
                catch
                {
                    continue;
                }
            }

            return "UTF-8"; // 默认返回UTF-8
        }

        /// <summary>
        /// 转换文件编码
        /// </summary>
        public async Task<bool> ConvertFileEncodingAsync(string sourceFilePath, string targetFilePath, string sourceEncoding = null, string targetEncoding = "UTF-8")
        {
            try
            {
                // 如果未指定源编码，则自动检测
                if (string.IsNullOrEmpty(sourceEncoding))
                {
                    sourceEncoding = await DetectFileEncodingAsync(sourceFilePath);
                }

                // 读取源文件
                string content;
                using (var reader = new StreamReader(sourceFilePath, Encoding.GetEncoding(sourceEncoding)))
                {
                    content = await reader.ReadToEndAsync();
                }

                // 写入目标文件
                using var writer = new StreamWriter(targetFilePath, false, Encoding.GetEncoding(targetEncoding));
                await writer.WriteAsync(content);

                return true;
            }
            catch (Exception ex)
            {
                // TODO: 添加日志记录
                Console.WriteLine($"转换文件编码失败: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// 从手机存储导入书籍
        /// </summary>
        public async Task<Book> ImportFromDeviceAsync(string userId, string filePath)
        {
            try
            {
                // 检查文件是否存在
                if (!File.Exists(filePath))
                {
                    throw new FileNotFoundException("文件不存在", filePath);
                }

                // 获取文件信息
                var fileInfo = new FileInfo(filePath);
                var extension = fileInfo.Extension.ToLowerInvariant();

                // 创建临时文件路径
                var tempPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}{extension}");

                // 如果是txt文件，进行编码转换
                if (extension == ".txt")
                {
                    await ConvertFileEncodingAsync(filePath, tempPath);
                }
                else
                {
                    // 对于其他格式，直接复制
                    File.Copy(filePath, tempPath, true);
                }

                // 创建书籍信息
                var book = new Book
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = Path.GetFileNameWithoutExtension(filePath),
                    Format = extension.TrimStart('.'),
                    FileSize = fileInfo.Length,
                    LocalPath = tempPath,
                    IsLocal = true,
                    CreateTime = DateTime.Now,
                    LastUpdateTime = DateTime.Now
                };

                // 保存到数据库
                return await _bookService.ImportLocalBookAsync(tempPath);
            }
            catch (Exception ex)
            {
                // TODO: 添加日志记录
                Console.WriteLine($"导入书籍失败: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// 获取设备存储中的书籍文件列表
        /// </summary>
        public async Task<string[]> GetDeviceBookFilesAsync(string[] fileExtensions = null)
        {
            // 如果未指定扩展名，使用默认支持的格式
            if (fileExtensions == null || fileExtensions.Length == 0)
            {
                fileExtensions = new[] { ".txt", ".epub", ".pdf" };
            }

            var files = new List<string>();

            // 在UniApp中，我们需要使用特定的API来访问设备存储
            // 这里需要配合前端实现
            // TODO: 实现设备存储访问逻辑

            return files.ToArray();
        }
    }
}
