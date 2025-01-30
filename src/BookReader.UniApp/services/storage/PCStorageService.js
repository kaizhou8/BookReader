import IStorageService from './IStorageService';
import fs from 'fs';
import path from 'path';
import { remote } from 'electron';

/**
 * PC端存储服务实现
 */
export default class PCStorageService extends IStorageService {
  constructor() {
    super();
    // 在用户数据目录下创建应用数据目录
    this.baseDir = path.join(remote.app.getPath('userData'), 'BookReader');
    this.dataDir = path.join(this.baseDir, 'data');
    this.booksDir = path.join(this.baseDir, 'books');
    
    // 确保目录存在
    this.ensureDirSync(this.baseDir);
    this.ensureDirSync(this.dataDir);
    this.ensureDirSync(this.booksDir);
  }

  async set(key, value) {
    try {
      const filePath = path.join(this.dataDir, `${key}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(value), 'utf8');
    } catch (error) {
      console.error('存储数据失败:', error);
      throw error;
    }
  }

  async get(key) {
    try {
      const filePath = path.join(this.dataDir, `${key}.json`);
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      console.error('获取数据失败:', error);
      throw error;
    }
  }

  async remove(key) {
    try {
      const filePath = path.join(this.dataDir, `${key}.json`);
      await fs.promises.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('删除数据失败:', error);
        throw error;
      }
    }
  }

  async clear() {
    try {
      const files = await fs.promises.readdir(this.dataDir);
      await Promise.all(
        files.map(file => fs.promises.unlink(path.join(this.dataDir, file)))
      );
    } catch (error) {
      console.error('清除数据失败:', error);
      throw error;
    }
  }

  async keys() {
    try {
      const files = await fs.promises.readdir(this.dataDir);
      return files.map(file => path.basename(file, '.json'));
    } catch (error) {
      console.error('获取键列表失败:', error);
      return [];
    }
  }

  async saveFile(filePath, file) {
    try {
      const fullPath = path.join(this.booksDir, filePath);
      
      // 确保目录存在
      await this.ensureDir(path.dirname(fullPath));

      // 保存文件
      if (file instanceof File || file instanceof Blob) {
        const buffer = await file.arrayBuffer();
        await fs.promises.writeFile(fullPath, Buffer.from(buffer));
      } else if (file instanceof ArrayBuffer) {
        await fs.promises.writeFile(fullPath, Buffer.from(file));
      } else {
        throw new Error('不支持的文件类型');
      }

      return fullPath;
    } catch (error) {
      console.error('保存文件失败:', error);
      throw error;
    }
  }

  async readFile(filePath) {
    try {
      const fullPath = path.join(this.booksDir, filePath);
      const buffer = await fs.promises.readFile(fullPath);
      return buffer.buffer;
    } catch (error) {
      console.error('读取文件失败:', error);
      throw error;
    }
  }

  async deleteFile(filePath) {
    try {
      const fullPath = path.join(this.booksDir, filePath);
      await fs.promises.unlink(fullPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('删除文件失败:', error);
        throw error;
      }
    }
  }

  async getFileInfo(filePath) {
    try {
      const fullPath = path.join(this.booksDir, filePath);
      const stats = await fs.promises.stat(fullPath);
      return {
        size: stats.size,
        createTime: stats.birthtime,
        updateTime: stats.mtime
      };
    } catch (error) {
      console.error('获取文件信息失败:', error);
      throw error;
    }
  }

  // 工具方法

  /**
   * 确保目录存在（同步版本）
   * @private
   */
  ensureDirSync(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 确保目录存在
   * @private
   */
  async ensureDir(dir) {
    try {
      await fs.promises.access(dir);
    } catch (error) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
  }
}
