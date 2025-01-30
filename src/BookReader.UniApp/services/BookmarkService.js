import Bookmark from '../models/Bookmark';

export default class BookmarkService {
  constructor(uni) {
    this.uni = uni;
  }

  // 添加书签
  async addBookmark(bookmark) {
    try {
      const response = await this.uni.request({
        url: '/api/bookmarks',
        method: 'POST',
        data: bookmark
      });

      // 本地缓存
      const bookmarks = this.getLocalBookmarks(bookmark.bookId);
      bookmarks.push(bookmark);
      this.saveLocalBookmarks(bookmark.bookId, bookmarks);

      return response.data;
    } catch (error) {
      console.error('添加书签失败:', error);
      throw error;
    }
  }

  // 删除书签
  async deleteBookmark(bookId, bookmarkId) {
    try {
      await this.uni.request({
        url: `/api/bookmarks/${bookmarkId}`,
        method: 'DELETE'
      });

      // 更新本地缓存
      const bookmarks = this.getLocalBookmarks(bookId);
      const updatedBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
      this.saveLocalBookmarks(bookId, updatedBookmarks);
    } catch (error) {
      console.error('删除书签失败:', error);
      throw error;
    }
  }

  // 获取书签列表
  async getBookmarks(bookId) {
    try {
      // 先从本地获取
      const localBookmarks = this.getLocalBookmarks(bookId);
      
      // 从服务器获取最新数据
      const response = await this.uni.request({
        url: `/api/bookmarks/${bookId}`,
        method: 'GET'
      });

      if (response.data) {
        // 更新本地缓存
        this.saveLocalBookmarks(bookId, response.data);
        return response.data;
      }

      return localBookmarks;
    } catch (error) {
      console.error('获取书签列表失败:', error);
      return this.getLocalBookmarks(bookId);
    }
  }

  // 更新书签
  async updateBookmark(bookmark) {
    try {
      const response = await this.uni.request({
        url: `/api/bookmarks/${bookmark.id}`,
        method: 'PUT',
        data: bookmark
      });

      // 更新本地缓存
      const bookmarks = this.getLocalBookmarks(bookmark.bookId);
      const index = bookmarks.findIndex(b => b.id === bookmark.id);
      if (index !== -1) {
        bookmarks[index] = bookmark;
        this.saveLocalBookmarks(bookmark.bookId, bookmarks);
      }

      return response.data;
    } catch (error) {
      console.error('更新书签失败:', error);
      throw error;
    }
  }

  // 获取本地书签
  getLocalBookmarks(bookId) {
    const key = `bookmarks_${bookId}`;
    return this.uni.getStorageSync(key) || [];
  }

  // 保存本地书签
  saveLocalBookmarks(bookId, bookmarks) {
    const key = `bookmarks_${bookId}`;
    this.uni.setStorageSync(key, bookmarks);
  }
}
