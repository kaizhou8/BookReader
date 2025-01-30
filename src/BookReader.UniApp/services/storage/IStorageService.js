/**
 * 存储服务接口
 */
export default class IStorageService {
  /**
   * 保存数据
   * @param {string} key - 存储键
   * @param {any} value - 存储值
   * @returns {Promise<void>}
   */
  async set(key, value) {
    throw new Error('Method not implemented');
  }

  /**
   * 获取数据
   * @param {string} key - 存储键
   * @returns {Promise<any>}
   */
  async get(key) {
    throw new Error('Method not implemented');
  }

  /**
   * 删除数据
   * @param {string} key - 存储键
   * @returns {Promise<void>}
   */
  async remove(key) {
    throw new Error('Method not implemented');
  }

  /**
   * 清除所有数据
   * @returns {Promise<void>}
   */
  async clear() {
    throw new Error('Method not implemented');
  }

  /**
   * 获取所有键
   * @returns {Promise<string[]>}
   */
  async keys() {
    throw new Error('Method not implemented');
  }

  /**
   * 保存文件
   * @param {string} path - 文件路径
   * @param {File|Blob|ArrayBuffer} file - 文件数据
   * @returns {Promise<string>} 返回文件的完整路径
   */
  async saveFile(path, file) {
    throw new Error('Method not implemented');
  }

  /**
   * 读取文件
   * @param {string} path - 文件路径
   * @returns {Promise<ArrayBuffer>}
   */
  async readFile(path) {
    throw new Error('Method not implemented');
  }

  /**
   * 删除文件
   * @param {string} path - 文件路径
   * @returns {Promise<void>}
   */
  async deleteFile(path) {
    throw new Error('Method not implemented');
  }

  /**
   * 获取文件信息
   * @param {string} path - 文件路径
   * @returns {Promise<Object>} 文件信息，包含size、createTime、updateTime等
   */
  async getFileInfo(path) {
    throw new Error('Method not implemented');
  }
}
