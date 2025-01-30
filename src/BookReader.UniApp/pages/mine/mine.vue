<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="user-info" @click="handleUserClick">
      <image class="avatar" :src="user ? user.avatar || '/static/images/default-avatar.png' : '/static/images/default-avatar.png'" mode="aspectFill"></image>
      <view class="info">
        <text class="nickname">{{ user ? user.username : '点击登录' }}</text>
        <text class="id" v-if="user">ID: {{ user.id }}</text>
      </view>
    </view>

    <!-- 设置列表 -->
    <view class="settings-list">
      <!-- 阅读设置 -->
      <view class="settings-group">
        <view class="group-title">阅读设置</view>
        <view class="settings-item" @click="navigateToSetting('theme')">
          <text class="item-title">主题设置</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
        <view class="settings-item" @click="navigateToSetting('font')">
          <text class="item-title">字体设置</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>

      <!-- 缓存管理 -->
      <view class="settings-group">
        <view class="group-title">缓存管理</view>
        <view class="settings-item" @click="clearCache">
          <text class="item-title">清除缓存</text>
          <text class="cache-size">{{ cacheSize }}</text>
        </view>
      </view>

      <!-- 其他设置 -->
      <view class="settings-group">
        <view class="group-title">其他</view>
        <view class="settings-item" @click="checkUpdate">
          <text class="item-title">检查更新</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
        <view class="settings-item" @click="showAbout">
          <text class="item-title">关于我们</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="settings-group" v-if="user">
        <button class="btn-logout" @click="logout">退出登录</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      user: null,
      cacheSize: '0KB'
    }
  },

  onShow() {
    this.loadUserInfo();
    this.getCacheSize();
  },

  methods: {
    // 加载用户信息
    loadUserInfo() {
      const user = uni.getStorageSync('user');
      if (user) {
        this.user = user;
      }
    },

    // 处理用户点击
    handleUserClick() {
      if (!this.user) {
        uni.navigateTo({
          url: '/pages/login/login'
        });
      }
    },

    // 获取缓存大小
    async getCacheSize() {
      try {
        const res = await uni.getStorageInfo();
        this.cacheSize = this.formatSize(res.currentSize);
      } catch (error) {
        console.error('获取缓存大小失败:', error);
      }
    },

    // 格式化大小
    formatSize(size) {
      if (size < 1024) {
        return size + 'KB';
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + 'MB';
      } else {
        return (size / 1024 / 1024).toFixed(2) + 'GB';
      }
    },

    // 清除缓存
    clearCache() {
      uni.showModal({
        title: '提示',
        content: '确定要清除缓存吗？',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorage();
            this.cacheSize = '0KB';
            uni.showToast({
              title: '清除成功',
              icon: 'success'
            });
          }
        }
      });
    },

    // 导航到设置页面
    navigateToSetting(type) {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    },

    // 检查更新
    checkUpdate() {
      uni.showToast({
        title: '已是最新版本',
        icon: 'none'
      });
    },

    // 显示关于页面
    showAbout() {
      uni.showModal({
        title: '关于我们',
        content: 'BookReader v1.0.0\n一个简单的在线阅读器',
        showCancel: false
      });
    },

    // 退出登录
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除用户数据
            uni.removeStorageSync('token');
            uni.removeStorageSync('user');
            this.user = null;
            
            // 显示提示
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            });
          }
        }
      });
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 40rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 30rpx;
}

.info {
  flex: 1;
}

.nickname {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.id {
  font-size: 24rpx;
  color: #999;
}

.settings-list {
  background-color: #fff;
}

.settings-group {
  margin-bottom: 20rpx;
}

.group-title {
  padding: 20rpx;
  font-size: 28rpx;
  color: #999;
  background-color: #f5f5f5;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid #eee;
}

.item-title {
  font-size: 30rpx;
  color: #333;
}

.cache-size {
  font-size: 28rpx;
  color: #999;
}

.btn-logout {
  width: 90%;
  height: 80rpx;
  line-height: 80rpx;
  margin: 40rpx auto;
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 10rpx;
  font-size: 32rpx;
}
</style>
