import { config } from '@vue/test-utils';

// 配置全局组件
config.global.stubs = {
  // 添加需要的全局组件
};

// 配置全局属性
config.global.mocks = {
  // 模拟 uni 对象
  uni: {
    request: jest.fn(),
    showToast: jest.fn(),
    showModal: jest.fn(),
    navigateTo: jest.fn(),
    navigateBack: jest.fn(),
    switchTab: jest.fn(),
    setStorageSync: jest.fn(),
    getStorageSync: jest.fn(),
    removeStorageSync: jest.fn(),
    getStorageInfo: jest.fn()
  }
};
