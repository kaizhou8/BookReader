<template>
  <view class="container">
    <view class="login-box">
      <view class="logo">
        <image src="/static/images/logo.png" mode="aspectFit"></image>
      </view>
      
      <view class="form">
        <view class="input-group">
          <text class="label">用户名</text>
          <input type="text" v-model="username" placeholder="请输入用户名" />
        </view>
        
        <view class="input-group">
          <text class="label">密码</text>
          <input type="password" v-model="password" placeholder="请输入密码" />
        </view>
        
        <button class="btn-login" @click="login">登录</button>
        
        <view class="actions">
          <text class="link" @click="goToRegister">注册账号</text>
          <text class="link" @click="forgotPassword">忘记密码</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  inject: ['uni'],
  methods: {
    async login() {
      if (!this.username || !this.password) {
        this.uni.showToast({
          title: '请输入用户名和密码',
          icon: 'none'
        });
        return;
      }

      try {
        const response = await this.uni.request({
          url: '/api/login',
          method: 'POST',
          data: {
            username: this.username,
            password: this.password
          }
        });

        if (response.data.token) {
          this.uni.setStorageSync('token', response.data.token);
          this.uni.setStorageSync('user', response.data.user);
          this.uni.switchTab({
            url: '/pages/index/index'
          });
        } else {
          this.uni.showToast({
            title: '登录失败',
            icon: 'none'
          });
        }
      } catch (error) {
        this.uni.showToast({
          title: '登录失败，请稍后重试',
          icon: 'none'
        });
      }
    },
    
    goToRegister() {
      this.uni.navigateTo({
        url: '/pages/register/register'
      });
    },
    
    forgotPassword() {
      this.uni.showToast({
        title: '该功能暂未开放',
        icon: 'none'
      });
    }
  }
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  width: 80%;
  padding: 40rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.logo {
  text-align: center;
  margin-bottom: 60rpx;
}

.logo image {
  width: 200rpx;
  height: 200rpx;
}

.form {
  padding: 0 20rpx;
}

.input-group {
  margin-bottom: 40rpx;
}

.label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #eee;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.btn-login {
  width: 100%;
  height: 80rpx;
  background-color: #007AFF;
  color: #fff;
  border-radius: 10rpx;
  font-size: 32rpx;
  margin: 60rpx 0;
}

.actions {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
}

.link {
  color: #007AFF;
}
</style>
