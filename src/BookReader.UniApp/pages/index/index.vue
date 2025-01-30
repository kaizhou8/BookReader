<template>
  <view class="container">
    <!-- 顶部工具栏 -->
    <view class="toolbar flex-row space-between">
      <view class="flex-row">
        <text class="toolbar-title">我的书架</text>
        <text class="book-count">({{ books.length }})</text>
      </view>
      <view class="flex-row">
        <button class="btn-icon" @click="showImportOptions">
          <text class="iconfont icon-import">导入</text>
        </button>
        <button class="btn-icon" @click="toggleEditMode">
          <text class="iconfont icon-edit">编辑</text>
        </button>
      </view>
    </view>

    <!-- 书架列表 -->
    <scroll-view scroll-y class="book-list" :style="{ height: scrollHeight + 'px' }">
      <view class="book-grid">
        <view v-for="book in sortedBooks" :key="book.id" class="book-item" @click="openBook(book)">
          <view class="book-cover">
            <image :src="book.coverUrl || '/static/images/default-cover.png'" mode="aspectFill"></image>
            <view v-if="isEditMode" class="select-overlay" @click.stop="toggleSelect(book)">
              <text class="iconfont" :class="{'icon-selected': selectedBooks.includes(book.id)}"></text>
            </view>
          </view>
          <view class="book-info">
            <text class="book-title">{{ book.title }}</text>
            <text class="book-progress">已读{{ getReadingProgress(book) }}%</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部工具栏（编辑模式） -->
    <view v-if="isEditMode" class="bottom-toolbar flex-row space-between">
      <button class="btn btn-secondary" @click="selectAll">全选</button>
      <button class="btn btn-primary" @click="deleteSelected">删除({{ selectedBooks.length }})</button>
    </view>

    <!-- 导入选项弹窗 -->
    <uni-popup ref="importPopup" type="bottom">
      <view class="popup-content">
        <view class="popup-title">导入书籍</view>
        <view class="popup-item" @click="importFromDevice">
          <text class="iconfont icon-folder"></text>
          <text>从手机导入</text>
        </view>
        <view class="popup-item" @click="importFromUrl">
          <text class="iconfont icon-link"></text>
          <text>从网址导入</text>
        </view>
        <view class="popup-cancel" @click="hideImportOptions">取消</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import BookService from '../../services/BookService';

export default {
  data() {
    return {
      bookService: new BookService(uni),
      books: [],
      isEditMode: false,
      selectedBooks: [],
      scrollHeight: 0,
      searchKeyword: '',
      currentCategory: '',
      categories: [],
      isLoading: false,
      sortBy: 'lastReadTime' // 默认按最后阅读时间排序
    }
  },

  computed: {
    sortedBooks() {
      return [...this.books].sort((a, b) => {
        switch(this.sortBy) {
          case 'lastReadTime':
            return (b.lastReadTime || 0) - (a.lastReadTime || 0);
          case 'title':
            return (a.title || '').localeCompare(b.title || '');
          case 'progress':
            return (b.readingProgress || 0) - (a.readingProgress || 0);
          default:
            return 0;
        }
      });
    }
  },

  async onLoad() {
    // 计算滚动区域高度
    const systemInfo = uni.getSystemInfoSync();
    this.scrollHeight = systemInfo.windowHeight - 100;
    
    // 加载数据
    await this.initialize();
  },

  onPullDownRefresh() {
    this.refreshData();
  },

  methods: {
    async initialize() {
      this.isLoading = true;
      try {
        await Promise.all([
          this.loadBooks(),
          this.loadCategories()
        ]);
      } catch (error) {
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },

    async refreshData() {
      try {
        await this.bookService.syncBooks();
        await this.loadBooks();
        uni.showToast({
          title: '刷新成功',
          icon: 'success'
        });
      } catch (error) {
        uni.showToast({
          title: '刷新失败',
          icon: 'none'
        });
      } finally {
        uni.stopPullDownRefresh();
      }
    },

    async loadBooks() {
      try {
        if (this.searchKeyword) {
          this.books = await this.bookService.searchBooks(this.searchKeyword);
        } else if (this.currentCategory) {
          this.books = await this.bookService.getBooksByCategory(this.currentCategory);
        } else {
          this.books = await this.bookService.getBooks();
        }
      } catch (error) {
        console.error('加载书籍失败:', error);
        uni.showToast({
          title: '加载书籍失败',
          icon: 'none'
        });
      }
    },

    async loadCategories() {
      try {
        this.categories = await this.bookService.getCategories();
      } catch (error) {
        console.error('加载分类失败:', error);
      }
    },

    // 打开书籍
    openBook(book) {
      if (this.isEditMode) return;
      uni.navigateTo({
        url: `/pages/reader/reader?id=${book.id}`
      });
    },

    // 显示导入选项
    showImportOptions() {
      this.$refs.importPopup.open();
    },

    // 隐藏导入选项
    hideImportOptions() {
      this.$refs.importPopup.close();
    },

    // 从设备导入
    async importFromDevice() {
      try {
        const [fileEntry] = await uni.chooseFile({
          extension: ['.txt', '.epub'],
          multiple: false
        });

        uni.showLoading({
          title: '导入中...'
        });

        const formData = new FormData();
        formData.append('file', fileEntry);

        const uploadRes = await uni.uploadFile({
          url: '/api/books/import/file',
          name: 'file',
          formData: formData
        });

        if (uploadRes.statusCode === 200) {
          const data = JSON.parse(uploadRes.data);
          if (data.success) {
            await this.bookService.addBook({
              ...data.book,
              filePath: data.filePath
            });
            await this.loadBooks();
            uni.showToast({
              title: '导入成功',
              icon: 'success'
            });
          } else {
            throw new Error(data.message || '导入失败');
          }
        } else {
          throw new Error('导入失败');
        }
      } catch (error) {
        console.error('导入失败:', error);
        uni.showToast({
          title: error.message || '导入失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
        this.hideImportOptions();
      }
    },

    // 从网址导入
    importFromUrl() {
      uni.navigateTo({
        url: '/pages/import/url'
      });
      this.hideImportOptions();
    },

    // 切换编辑模式
    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
      if (!this.isEditMode) {
        this.selectedBooks = [];
      }
    },

    // 切换选择状态
    toggleSelect(book) {
      const index = this.selectedBooks.indexOf(book.id);
      if (index === -1) {
        this.selectedBooks.push(book.id);
      } else {
        this.selectedBooks.splice(index, 1);
      }
    },

    // 全选
    selectAll() {
      if (this.selectedBooks.length === this.books.length) {
        this.selectedBooks = [];
      } else {
        this.selectedBooks = this.books.map(book => book.id);
      }
    },

    // 删除选中的书籍
    async deleteSelected() {
      if (!this.selectedBooks.length) return;
      
      try {
        await uni.showModal({
          title: '确认删除',
          content: `确定要删除选中的 ${this.selectedBooks.length} 本书籍吗？`,
          confirmText: '删除',
          confirmColor: '#ff0000'
        });

        uni.showLoading({
          title: '删除中...'
        });

        await this.bookService.deleteBooks(this.selectedBooks);
        await this.loadBooks();

        this.selectedBooks = [];
        this.isEditMode = false;

        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
      } catch (error) {
        console.error('删除失败:', error);
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 获取阅读进度
    getReadingProgress(book) {
      return book.readingProgress || 0;
    },

    // 搜索书籍
    async onSearch(keyword) {
      this.searchKeyword = keyword;
      await this.loadBooks();
    },

    // 切换分类
    async changeCategory(category) {
      this.currentCategory = category;
      await this.loadBooks();
    },

    // 切换排序方式
    changeSortBy(sortBy) {
      this.sortBy = sortBy;
    }
  }
}
</script>

<style>
.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.toolbar {
  padding: 20rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #eee;
}

.toolbar-title {
  font-size: 32rpx;
  font-weight: bold;
}

.book-count {
  font-size: 24rpx;
  color: #999;
  margin-left: 10rpx;
}

.btn-icon {
  background: none;
  border: none;
  padding: 10rpx 20rpx;
  font-size: 28rpx;
  color: #666;
}

.book-list {
  flex: 1;
}

.book-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx;
}

.book-item {
  width: 33.33%;
  padding: 10rpx;
  box-sizing: border-box;
}

.book-cover {
  position: relative;
  width: 100%;
  padding-top: 133%; /* 3:4 比例 */
  background-color: #eee;
  border-radius: 8rpx;
  overflow: hidden;
}

.book-cover image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.select-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-info {
  margin-top: 10rpx;
}

.book-title {
  font-size: 24rpx;
  color: #333;
  line-height: 1.2;
  height: 2.4em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.book-progress {
  font-size: 20rpx;
  color: #999;
  margin-top: 4rpx;
}

.bottom-toolbar {
  padding: 20rpx;
  background-color: #ffffff;
  border-top: 1rpx solid #eee;
}

.btn {
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
}

.btn-primary {
  background-color: #ff6b6b;
  color: #ffffff;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
}

.popup-content {
  background-color: #ffffff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 30rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}

.popup-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #333;
}

.popup-item .iconfont {
  margin-right: 20rpx;
  font-size: 36rpx;
  color: #666;
}

.popup-cancel {
  margin-top: 20rpx;
  padding: 20rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #999;
  border-top: 1rpx solid #eee;
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.space-between {
  justify-content: space-between;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 30rpx;
  color: #999;
}

/* 空状态 */
.empty {
  text-align: center;
  padding: 100rpx 30rpx;
  color: #999;
}

.empty-icon {
  font-size: 80rpx;
  color: #ddd;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
}
</style>
