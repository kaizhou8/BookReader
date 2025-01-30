import IStorageService from './IStorageService';
import PermissionService from '../PermissionService';

/**
 * 移动端存储服务实现
 */
export default class MobileStorageService extends IStorageService {
  constructor(uni) {
    super();
    this.uni = uni;
    this.baseDir = 'books/'; // 基础存储目录
    this.permissionService = new PermissionService(uni);
  }

  /**
   * 确保有存储权限
   * @private
   */
  async ensureStoragePermission() {
    const hasPermission = await this.permissionService.requestStoragePermission();
    if (!hasPermission) {
      throw new Error('没有存储权限，请在设置中允许应用访问存储空间');
    }
  }

  async set(key, value) {
    try {
      await this.ensureStoragePermission();
      await this.uni.setStorage({
        key,
        data: value
      });
    } catch (error) {
      console.error('存储数据失败:', error);
      throw error;
    }
  }

  async get(key) {
    try {
      await this.ensureStoragePermission();
      const { data } = await this.uni.getStorage({ key });
      return data;
    } catch (error) {
      if (error.message.includes('storage permission')) {
        throw error;
      }
      console.error('获取数据失败:', error);
      return null;
    }
  }

  async remove(key) {
    try {
      await this.ensureStoragePermission();
      await this.uni.removeStorage({ key });
    } catch (error) {
      console.error('删除数据失败:', error);
      throw error;
    }
  }

  async clear() {
    try {
      await this.ensureStoragePermission();
      await this.uni.clearStorage();
    } catch (error) {
      console.error('清除数据失败:', error);
      throw error;
    }
  }

  async keys() {
    try {
      await this.ensureStoragePermission();
      const { keys } = await this.uni.getStorageInfo();
      return keys;
    } catch (error) {
      console.error('获取键列表失败:', error);
      return [];
    }
  }

  async saveFile(path, file) {
    try {
      await this.ensureStoragePermission();
      const fullPath = this.getFullPath(path);
      
      // 确保目录存在
      const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
      await this.ensureDir(dir);

      // 保存文件
      if (file instanceof File || file instanceof Blob) {
        const { savedFilePath } = await this.uni.saveFile({
          tempFilePath: file
        });
        return savedFilePath;
      } else if (file instanceof ArrayBuffer) {
        const { savedFilePath } = await this.uni.saveFile({
          tempFilePath: await this.arrayBufferToTempFile(file)
        });
        return savedFilePath;
      }

      throw new Error('不支持的文件类型');
    } catch (error) {
      console.error('保存文件失败:', error);
      throw error;
    }
  }

  async readFile(path) {
    try {
      await this.ensureStoragePermission();
      const fullPath = this.getFullPath(path);
      const { data } = await this.uni.getFileSystemManager().readFile({
        filePath: fullPath,
        encoding: 'binary'
      });
      return data;
    } catch (error) {
      console.error('读取文件失败:', error);
      throw error;
    }
  }

  async deleteFile(path) {
    try {
      await this.ensureStoragePermission();
      const fullPath = this.getFullPath(path);
      await this.uni.getFileSystemManager().unlink({
        filePath: fullPath
      });
    } catch (error) {
      console.error('删除文件失败:', error);
      throw error;
    }
  }

  async getFileInfo(path) {
    try {
      await this.ensureStoragePermission();
      const fullPath = this.getFullPath(path);
      const stats = await this.uni.getFileSystemManager().stat({
        path: fullPath
      });
      return {
        size: stats.size,
        createTime: stats.createTime,
        updateTime: stats.lastModifiedTime
      };
    } catch (error) {
      console.error('获取文件信息失败:', error);
      throw error;
    }
  }

  // 工具方法

  /**
   * 获取完整路径
   * @private
   */
  getFullPath(path) {
    // 获取应用运行目录
    const userPath = this.uni.env.USER_DATA_PATH;
    return `${userPath}/${this.baseDir}${path}`;
  }

  /**
   * 确保目录存在
   * @private
   */
  async ensureDir(dir) {
    try {
      await this.uni.getFileSystemManager().access({
        path: dir
      });
    } catch (error) {
      // 目录不存在，创建目录
      await this.uni.getFileSystemManager().mkdir({
        dirPath: dir,
        recursive: true
      });
    }
  }

  /**
   * 将ArrayBuffer转换为临时文件
   * @private
   */
  async arrayBufferToTempFile(buffer) {
    const tempFilePath = `${this.uni.env.USER_DATA_PATH}/temp_${Date.now()}`;
    await this.uni.getFileSystemManager().writeFile({
      filePath: tempFilePath,
      data: buffer,
      encoding: 'binary'
    });
    return tempFilePath;
  }
}
