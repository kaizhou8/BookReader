using System.Threading.Tasks;

namespace BookReader.Core.Interfaces
{
    /// <summary>
    /// 文件服务接口
    /// </summary>
    public interface IFileService
    {
        /// <summary>
        /// 检测文本文件编码
        /// </summary>
        /// <param name="filePath">文件路径</param>
        /// <returns>编码名称</returns>
        Task<string> DetectFileEncodingAsync(string filePath);

        /// <summary>
        /// 转换文件编码
        /// </summary>
        /// <param name="sourceFilePath">源文件路径</param>
        /// <param name="targetFilePath">目标文件路径</param>
        /// <param name="sourceEncoding">源编码（如果为null则自动检测）</param>
        /// <param name="targetEncoding">目标编码（默认UTF-8）</param>
        /// <returns>转换是否成功</returns>
        Task<bool> ConvertFileEncodingAsync(string sourceFilePath, string targetFilePath, string sourceEncoding = null, string targetEncoding = "UTF-8");

        /// <summary>
        /// 从手机存储导入书籍
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="filePath">文件路径</param>
        /// <returns>导入的书籍信息</returns>
        Task<Common.Models.Book> ImportFromDeviceAsync(string userId, string filePath);

        /// <summary>
        /// 获取设备存储中的书籍文件列表
        /// </summary>
        /// <param name="fileExtensions">文件扩展名列表</param>
        /// <returns>文件路径列表</returns>
        Task<string[]> GetDeviceBookFilesAsync(string[] fileExtensions = null);
    }
}
