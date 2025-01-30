const baseURL = 'http://localhost:5000'; // 开发环境API地址

// 请求拦截器
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 组装完整请求地址
    const url = baseURL + options.url;
    
    // 获取token
    const token = uni.getStorageSync('token');
    
    // 请求头
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    };
    
    // 如果有token，添加到请求头
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }
    
    // 发起请求
    uni.request({
      url,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        // 请求成功
        if (res.statusCode === 200) {
          resolve(res.data);
        }
        // 未授权
        else if (res.statusCode === 401) {
          // 清除本地token
          uni.removeStorageSync('token');
          uni.removeStorageSync('user');
          
          // 跳转到登录页
          uni.redirectTo({
            url: '/pages/login/login'
          });
          
          reject(new Error('未授权或token已过期'));
        }
        // 其他错误
        else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        reject(new Error('网络请求失败'));
      }
    });
  });
};

// GET请求
const get = (url, data = {}) => {
  return request({
    url,
    method: 'GET',
    data
  });
};

// POST请求
const post = (url, data = {}) => {
  return request({
    url,
    method: 'POST',
    data
  });
};

// PUT请求
const put = (url, data = {}) => {
  return request({
    url,
    method: 'PUT',
    data
  });
};

// DELETE请求
const del = (url, data = {}) => {
  return request({
    url,
    method: 'DELETE',
    data
  });
};

export default {
  get,
  post,
  put,
  delete: del
};
