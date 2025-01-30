<template>
  <view class="container">
    <!-- 顶部封面区域 -->
    <view class="book-header">
      <image class="book-cover" :src="book.coverUrl || '/static/images/default-cover.png'" mode="aspectFill"></image>
      <view class="book-info">
        <text class="book-title">{{ book.title }}</text>
        <text class="book-author">{{ book.author }}</text>
        <view class="book-meta">
          <text class="meta-item">{{ book.format?.toUpperCase() }}</text>
          <text class="meta-item">{{ formatFileSize(book.fileSize) }}</text>
          <text class="meta-item">阅读至 {{ book.readingProgress }}%</text>
        </view>
        <view class="book-tags" v-if="book.tags?.length">
          <text v-for="tag in book.tags" :key="tag" class="tag">{{ tag }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="btn btn-primary" @click="startReading">继续阅读</button>
      <button class="btn btn-secondary" @click="showMoreActions">更多操作</button>
    </view>

    <!-- 书籍详情 -->
    <view class="book-detail">
      <view class="section">
        <view class="section-header">
          <text class="section-title">内容简介</text>
        </view>
        <text class="description">{{ book.description || '暂无简介' }}</text>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">目录</text>
          <text class="chapter-count">({{ book.chapters?.length || 0 }}章)</text>
        </view>
        <view class="chapter-list">
          <view v-for="(chapter, index) in book.chapters" :key="index" 
                class="chapter-item" @click="goToChapter(index)">
            <text class="chapter-title">{{ chapter.title }}</text>
            <text class="chapter-progress" v-if="currentChapterIndex === index">当前阅读</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">阅读信息</text>
        </view>
        <view class="reading-info">
          <view class="info-item">
            <text class="info-label">最近阅读</text>
            <text class="info-value">{{ formatLastReadTime }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">阅读时长</text>
            <text class="info-value">{{ readingTime }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">添加时间</text>
            <text class="info-value">{{ formatDate(book.createTime) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 更多操作弹窗 -->
    <uni-popup ref="actionsPopup" type="bottom">
      <view class="popup-content">
        <view class="popup-title">更多操作</view>
        <view class="popup-item" @click="editBookInfo">
          <text class="iconfont icon-edit"></text>
          <text>编辑信息</text>
        </view>
        <view class="popup-item" @click="addToCategory">
          <text class="iconfont icon-category"></text>
          <text>移动分类</text>
        </view>
        <view class="popup-item" @click="manageBookmarks">
          <text class="iconfont icon-bookmark"></text>
          <text>书签管理</text>
        </view>
        <view class="popup-item warning" @click="deleteBook">
          <text class="iconfont icon-delete"></text>
          <text>删除图书</text>
        </view>
        <view class="popup-cancel" @click="hideMoreActions">取消</view>
      </view>
    </uni-popup>

    <!-- 编辑信息弹窗 -->
    <uni-popup ref="editPopup" type="center">
      <view class="edit-popup">
        <view class="popup-title">编辑信息</view>
        <view class="form-item">
          <text class="label">书名</text>
          <input class="input" v-model="editForm.title" placeholder="请输入书名"/>
        </view>
        <view class="form-item">
          <text class="label">作者</text>
          <input class="input" v-model="editForm.author" placeholder="请输入作者"/>
        </view>
        <view class="form-item">
          <text class="label">简介</text>
          <textarea class="textarea" v-model="editForm.description" placeholder="请输入简介"/>
        </view>
        <view class="form-item">
          <text class="label">标签</text>
          <input class="input" v-model="editForm.tags" placeholder="多个标签用逗号分隔"/>
        </view>
        <view class="popup-buttons">
          <button class="btn btn-secondary" @click="cancelEdit">取消</button>
          <button class="btn btn-primary" @click="saveEdit">保存</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import BookService from '../../services/BookService';
import { formatDate, formatFileSize } from '../../utils/formatter';

export default {
  data() {
    return {
      bookService: new BookService(uni),
      book: {},
      currentChapterIndex: 0,
      readingTime: '0分钟',
      editForm: {
        title: '',
        author: '',
        description: '',
        tags: ''
      }
    }
  },

  computed: {
    formatLastReadTime() {
      if (!this.book.lastReadTime) return '未阅读';
      return formatDate(this.book.lastReadTime);
    }
  },

  onLoad(options) {
    if (options.id) {
      this.loadBookDetail(options.id);
    }
  },

  methods: {
    formatDate,
    formatFileSize,

    async loadBookDetail(id) {
      try {
        uni.showLoading({ title: '加载中...' });
        const book = await this.bookService.getBook(id);
        if (!book) {
          throw new Error('书籍不存在');
        }
        this.book = book;
        this.currentChapterIndex = this.calculateCurrentChapter();
        this.calculateReadingTime();
      } catch (error) {
        uni.showToast({
          title: error.message || '加载失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },

    calculateCurrentChapter() {
      if (!this.book.chapters?.length) return 0;
      // 根据阅读进度计算当前章节
      const progress = this.book.readingProgress / 100;
      return Math.floor(progress * this.book.chapters.length);
    },

    calculateReadingTime() {
      // 这里应该从阅读记录中计算实际阅读时长
      // 暂时返回模拟数据
      this.readingTime = '30分钟';
    },

    startReading() {
      uni.navigateTo({
        url: `/pages/reader/reader?id=${this.book.id}&chapter=${this.currentChapterIndex}`
      });
    },

    goToChapter(index) {
      uni.navigateTo({
        url: `/pages/reader/reader?id=${this.book.id}&chapter=${index}`
      });
    },

    showMoreActions() {
      this.$refs.actionsPopup.open();
    },

    hideMoreActions() {
      this.$refs.actionsPopup.close();
    },

    editBookInfo() {
      this.editForm = {
        title: this.book.title,
        author: this.book.author,
        description: this.book.description,
        tags: (this.book.tags || []).join(',')
      };
      this.hideMoreActions();
      this.$refs.editPopup.open();
    },

    async saveEdit() {
      try {
        uni.showLoading({ title: '保存中...' });
        const tags = this.editForm.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        
        await this.bookService.updateBook(this.book.id, {
          ...this.editForm,
          tags
        });

        await this.loadBookDetail(this.book.id);
        
        this.$refs.editPopup.close();
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
      } catch (error) {
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },

    cancelEdit() {
      this.$refs.editPopup.close();
    },

    async addToCategory() {
      this.hideMoreActions();
      uni.navigateTo({
        url: `/pages/category/select?bookId=${this.book.id}`
      });
    },

    manageBookmarks() {
      this.hideMoreActions();
      uni.navigateTo({
        url: `/pages/bookmark/list?bookId=${this.book.id}`
      });
    },

    async deleteBook() {
      try {
        const [error] = await uni.showModal({
          title: '确认删除',
          content: '确定要删除这本书吗？删除后将无法恢复。',
          confirmText: '删除',
          confirmColor: '#ff0000'
        });

        if (error) return;

        uni.showLoading({ title: '删除中...' });
        await this.bookService.deleteBook(this.book.id);

        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });

        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (error) {
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.book-header {
  padding: 40rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
}

.book-cover {
  width: 200rpx;
  height: 280rpx;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.book-info {
  flex: 1;
  margin-left: 30rpx;
}

.book-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.book-author {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.book-meta {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #999;
  margin-right: 20rpx;
}

.book-tags {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  font-size: 24rpx;
  color: #666;
  background-color: #f0f0f0;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
}

.action-buttons {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  background-color: #ffffff;
  margin-bottom: 20rpx;
}

.btn {
  flex: 1;
  margin: 0 10rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.btn-primary {
  background-color: #ff6b6b;
  color: #ffffff;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
  border: 2rpx solid #ddd;
}

.book-detail {
  background-color: #ffffff;
  padding: 30rpx;
}

.section {
  margin-bottom: 40rpx;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.chapter-count {
  font-size: 24rpx;
  color: #999;
  margin-left: 10rpx;
}

.description {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.chapter-list {
  max-height: 600rpx;
  overflow-y: auto;
}

.chapter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}

.chapter-title {
  font-size: 28rpx;
  color: #333;
}

.chapter-progress {
  font-size: 24rpx;
  color: #ff6b6b;
}

.reading-info {
  background-color: #f9f9f9;
  border-radius: 8rpx;
  padding: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
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
  padding: 30rpx 0;
  font-size: 28rpx;
  color: #333;
}

.popup-item.warning {
  color: #ff6b6b;
}

.popup-item .iconfont {
  margin-right: 20rpx;
  font-size: 36rpx;
}

.popup-cancel {
  margin-top: 20rpx;
  padding: 20rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #999;
  border-top: 2rpx solid #f5f5f5;
}

.edit-popup {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 30rpx;
  width: 600rpx;
}

.form-item {
  margin-bottom: 20rpx;
}

.label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.input {
  width: 100%;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.textarea {
  width: 100%;
  height: 200rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.popup-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 30rpx;
}

.popup-buttons .btn {
  width: 160rpx;
  height: 60rpx;
  line-height: 60rpx;
  margin-left: 20rpx;
}
</style>
