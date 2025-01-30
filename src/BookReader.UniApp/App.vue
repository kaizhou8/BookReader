<script>
export default {
  onLaunch: function() {
    console.log('App Launch');
    // 检查更新
    this.checkUpdate();
    // 初始化主题
    this.initTheme();
  },
  onShow: function() {
    console.log('App Show');
  },
  onHide: function() {
    console.log('App Hide');
  },
  methods: {
    // 检查应用更新
    checkUpdate() {
      // #ifdef APP-PLUS
      plus.runtime.getProperty(plus.runtime.appid, (widgetInfo) => {
        uni.request({
          url: 'your-api-endpoint/check-update',
          data: {
            version: widgetInfo.version
          },
          success: (res) => {
            if (res.data.hasUpdate) {
              // 提示更新
              uni.showModal({
                title: '发现新版本',
                content: res.data.updateDesc,
                success: (res) => {
                  if (res.confirm) {
                    // 下载更新
                    plus.runtime.openURL(res.data.downloadUrl);
                  }
                }
              });
            }
          }
        });
      });
      // #endif
    },
    
    // 初始化主题
    initTheme() {
      const theme = uni.getStorageSync('theme') || 'light';
      this.setTheme(theme);
    },
    
    // 设置主题
    setTheme(theme) {
      uni.setStorageSync('theme', theme);
      // 应用主题样式
      const pages = getCurrentPages();
      pages.forEach(page => {
        if (page.$vm) {
          page.$vm.$emit('themeChanged', theme);
        }
      });
    }
  },
  onReady() {
    // 添加全局导航守卫
    uni.addInterceptor({
      navigateTo: (handler, interceptor) => {
        console.log('navigateTo:', handler);
        // 可以在这里进行一些操作，如检查登录状态等
        interceptor(true);
      },
      redirectTo: (handler, interceptor) => {
        console.log('redirectTo:', handler);
        // 可以在这里进行一些操作，如检查登录状态等
        interceptor(true);
      },
      reLaunch: (handler, interceptor) => {
        console.log('reLaunch:', handler);
        // 可以在这里进行一些操作，如检查登录状态等
        interceptor(true);
      }
    });
  }
};
</script>

<style>
/*每个页面公共css */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
    Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
    sans-serif;
}

/* 主题样式 */
/* 浅色主题 */
.theme-light {
  --background-color: #f5f5f5;
  --text-color: #333;
  --border-color: #eee;
  --primary-color: #007AFF;
  --secondary-color: #999;
}

/* 深色主题 */
.theme-dark {
  --background-color: #1a1a1a;
  --text-color: #fff;
  --border-color: #333;
  --primary-color: #409EFF;
  --secondary-color: #666;
}

/* 护眼主题 */
.theme-eye {
  --background-color: #c7edcc;
  --text-color: #333;
  --border-color: #a8d8b9;
  --primary-color: #2c7a34;
  --secondary-color: #666;
}

/* 布局相关 */
.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.space-between {
  justify-content: space-between;
}

.space-around {
  justify-content: space-around;
}

.center {
  justify-content: center;
  align-items: center;
}

/* 按钮样式 */
.btn {
  padding: 20rpx 40rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  text-align: center;
}

.btn-primary {
  background-color: var(--primary-color);
  color: #fff;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
}

.btn-danger {
  background-color: #ff4d4f;
  color: #fff;
}

.btn-icon {
  padding: 10rpx;
  background: none;
  border: none;
  font-size: 28rpx;
  color: #666;
}

.btn-icon::after {
  border: none;
}

/* 文本样式 */
.text-primary {
  color: var(--primary-color);
}

.text-secondary {
  color: var(--secondary-color);
}

.text-danger {
  color: #ff4d4f;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

/* 边距和分隔线 */
.divider {
  height: 1rpx;
  background-color: var(--border-color);
  margin: 20rpx 0;
}

.margin-top {
  margin-top: 20rpx;
}

.margin-bottom {
  margin-bottom: 20rpx;
}

.padding {
  padding: 20rpx;
}

/* 卡片样式 */
.card {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}
</style>
