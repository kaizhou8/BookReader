<template>
  <view class="container">
    <!-- 导入表单 -->
    <view class="import-form">
      <view class="form-item">
        <text class="label">书籍网址</text>
        <input 
          class="input" 
          type="text" 
          v-model="bookUrl"
          placeholder="请输入书籍网址"
          @confirm="handleImport"
        />
      </view>
      <button class="btn-import" @click="handleImport" :disabled="!bookUrl || isLoading">
        <text v-if="!isLoading">开始导入</text>
        <text v-else>导入中...</text>
      </button>
    </view>

    <!-- 支持的网站列表 -->
    <view class="supported-sites">
      <view class="section-title">支持的网站</view>
      <view class="site-list">
        <view v-for="site in supportedSites" :key="site.id" class="site-item">
          <text class="site-name">{{ site.name }}</text>
          <text class="site-desc">{{ site.description }}</text>
        </view>
      </view>
    </view>

    <!-- 导入说明 -->
    <view class="import-guide">
      <view class="section-title">导入说明</view>
      <view class="guide-content">
        <text class="guide-text">1. 复制您想要导入的书籍网址</text>
        <text class="guide-text">2. 粘贴到上方输入框中</text>
        <text class="guide-text">3. 点击"开始导入"按钮</text>
        <text class="guide-text">4. 等待导入完成即可阅读</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      bookUrl: '',
      isLoading: false,
      supportedSites: [
        {
          id: 1,
          name: '笔趣阁',
          description: '支持笔趣阁系列网站的小说导入'
        },
        {
          id: 2,
          name: '起点中文网',
          description: '支持起点中文网免费章节导入'
        },
        {
          id: 3,
          name: '纵横中文网',
          description: '支持纵横中文网免费章节导入'
        }
      ]
    }
  },

  methods: {
    // 处理导入
    async handleImport() {
      if (!this.bookUrl || this.isLoading) return;

      // 验证URL格式
      if (!this.validateUrl(this.bookUrl)) {
        uni.showToast({
          title: '请输入有效的网址',
          icon: 'none'
        });
        return;
      }

      this.isLoading = true;

      try {
        // 调用导入API
        const res = await uni.request({
          url: '/api/books/import',
          method: 'POST',
          data: {
            url: this.bookUrl
          }
        });

        if (res.statusCode === 200 && res.data.success) {
          uni.showToast({
            title: '导入成功',
            icon: 'success'
          });

          // 返回书架页面
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          throw new Error(res.data.message || '导入失败');
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '导入失败，请稍后重试',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },

    // 验证URL格式
    validateUrl(url) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }
  }
}
</script>

<style>
.container {
  padding: 30rpx;
}

.import-form {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 20rpx;
}

.label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
}

.btn-import {
  width: 100%;
  height: 80rpx;
  background: #1296db;
  color: #fff;
  border-radius: 8rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-import[disabled] {
  background: #ccc;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.supported-sites {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.site-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.site-item {
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
}

.site-name {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 6rpx;
}

.site-desc {
  font-size: 24rpx;
  color: #666;
}

.import-guide {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.guide-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.guide-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}
</style>
