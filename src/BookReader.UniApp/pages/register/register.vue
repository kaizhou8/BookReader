<template>
  <view class="container">
    <view class="register-box">
      <view class="title">注册账号</view>
      
      <view class="form">
        <view class="input-group">
          <text class="label">用户名</text>
          <input type="text" v-model="username" placeholder="请输入用户名" />
        </view>
        
        <view class="input-group">
          <text class="label">邮箱</text>
          <input type="email" v-model="email" placeholder="请输入邮箱" />
        </view>
        
        <view class="input-group">
          <text class="label">密码</text>
          <input type="password" v-model="password" placeholder="请输入密码" />
        </view>
        
        <view class="input-group">
          <text class="label">确认密码</text>
          <input type="password" v-model="confirmPassword" placeholder="请再次输入密码" />
        </view>
        
        <button class="btn-register" @click="register">注册</button>
        
        <view class="actions">
          <text>已有账号？</text>
          <text class="link" @click="goToLogin">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  },
  inject: ['uni'],
  methods: {
    async register() {
      // 表单验证
      if (!this.username || !this.email || !this.password || !this.confirmPassword) {
        this.uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }
      
      if (this.password !== this.confirmPassword) {
        this.uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        });
        return;
      }

      try {
        const response = await this.uni.request({
          url: '/api/register',
          method: 'POST',
          data: {
            username: this.username,
            email: this.email,
            password: this.password
          }
        });

        if (response.data) {
          this.uni.showToast({
            title: '注册成功',
            icon: 'success'
          });
          
          // 1.5秒后返回登录页
          setTimeout(() => {
            this.uni.navigateBack();
          }, 1500);
        } else {
          this.uni.showToast({
            title: '注册失败',
            icon: 'none'
          });
        }
      } catch (error) {
        this.uni.showToast({
          title: '注册失败，请稍后重试',
          icon: 'none'
        });
      }
    },
    
    goToLogin() {
      this.uni.navigateBack();
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
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 40rpx 0;
}

.register-box {
  width: 80%;
  padding: 40rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 60rpx;
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

.btn-register {
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
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
  color: #666;
}

.link {
  color: #007AFF;
  margin-left: 10rpx;
}
</style>
