import ReadingProgress from '../models/ReadingProgress';

export default class ReadingProgressService {
  constructor(uni) {
    this.uni = uni;
  }

  // 保存阅读进度
  async saveProgress(progress) {
    try {
      await this.uni.request({
        url: '/api/reading-progress',
        method: 'POST',
        data: progress
      });

      // 本地缓存
      const key = `reading_progress_${progress.bookId}`;
      this.uni.setStorageSync(key, progress);
    } catch (error) {
      console.error('保存阅读进度失败:', error);
      throw error;
    }
  }

  // 获取阅读进度
  async getProgress(bookId) {
    try {
      // 先从本地缓存获取
      const key = `reading_progress_${bookId}`;
      const localProgress = this.uni.getStorageSync(key);
      
      if (localProgress) {
        return localProgress;
      }

      // 从服务器获取
      const response = await this.uni.request({
        url: `/api/reading-progress/${bookId}`,
        method: 'GET'
      });

      if (response.data) {
        // 缓存到本地
        this.uni.setStorageSync(key, response.data);
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('获取阅读进度失败:', error);
      throw error;
    }
  }

  // 同步阅读进度
  async syncProgress(bookId) {
    try {
      const response = await this.uni.request({
        url: `/api/reading-progress/${bookId}/sync`,
        method: 'GET'
      });

      if (response.data) {
        const key = `reading_progress_${bookId}`;
        this.uni.setStorageSync(key, response.data);
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('同步阅读进度失败:', error);
      throw error;
    }
  }
}
