import { shallowMount } from '@vue/test-utils';
import Login from '@/pages/login/login.vue';

describe('Login.vue', () => {
  let wrapper;
  let mockUni;

  beforeEach(() => {
    mockUni = {
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
    };

    wrapper = shallowMount(Login, {
      global: {
        provide: {
          uni: mockUni
        }
      }
    });
  });

  it('初始化时表单为空', () => {
    expect(wrapper.vm.username).toBe('');
    expect(wrapper.vm.password).toBe('');
  });

  it('表单验证 - 用户名和密码为空时不能提交', async () => {
    await wrapper.vm.login();

    expect(mockUni.showToast).toHaveBeenCalledWith({
      title: '请输入用户名和密码',
      icon: 'none'
    });
  });

  it('表单验证 - 只填写用户名时不能提交', async () => {
    wrapper.vm.username = 'testuser';
    await wrapper.vm.login();

    expect(mockUni.showToast).toHaveBeenCalledWith({
      title: '请输入用户名和密码',
      icon: 'none'
    });
  });

  it('表单验证 - 只填写密码时不能提交', async () => {
    wrapper.vm.password = 'password123';
    await wrapper.vm.login();

    expect(mockUni.showToast).toHaveBeenCalledWith({
      title: '请输入用户名和密码',
      icon: 'none'
    });
  });

  it('登录成功时保存token和用户信息并跳转', async () => {
    mockUni.request.mockResolvedValue({
      data: {
        token: 'test-token',
        user: { id: '1', username: 'testuser' }
      }
    });

    wrapper.vm.username = 'testuser';
    wrapper.vm.password = 'password123';
    await wrapper.vm.login();

    expect(mockUni.setStorageSync).toHaveBeenCalledWith('token', 'test-token');
    expect(mockUni.setStorageSync).toHaveBeenCalledWith('user', { id: '1', username: 'testuser' });
    expect(mockUni.switchTab).toHaveBeenCalledWith({
      url: '/pages/index/index'
    });
  });

  it('登录失败时显示错误提示', async () => {
    mockUni.request.mockResolvedValue({
      data: { error: '登录失败' }
    });

    wrapper.vm.username = 'testuser';
    wrapper.vm.password = 'password123';
    await wrapper.vm.login();

    expect(mockUni.showToast).toHaveBeenCalledWith({
      title: '登录失败',
      icon: 'none'
    });
  });

  it('网络错误时显示错误提示', async () => {
    mockUni.request.mockRejectedValue(new Error('网络错误'));

    wrapper.vm.username = 'testuser';
    wrapper.vm.password = 'password123';
    await wrapper.vm.login();

    expect(mockUni.showToast).toHaveBeenCalledWith({
      title: '登录失败，请稍后重试',
      icon: 'none'
    });
  });

  it('点击注册按钮跳转到注册页面', () => {
    wrapper.vm.goToRegister();

    expect(mockUni.navigateTo).toHaveBeenCalledWith({
      url: '/pages/register/register'
    });
  });

  it('点击忘记密码显示提示', () => {
    wrapper.vm.forgotPassword();

    expect(mockUni.showToast).toHaveBeenCalledWith({
      title: '该功能暂未开放',
      icon: 'none'
    });
  });
});
