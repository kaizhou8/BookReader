import { shallowMount } from '@vue/test-utils';
import Register from '@/pages/register/register.vue';

describe('Register.vue', () => {
  let wrapper;
  let mockUni;

  beforeEach(() => {
    jest.useFakeTimers();
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

    wrapper = shallowMount(Register, {
      global: {
        provide: {
          uni: mockUni
        }
      }
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('初始化时表单为空', () => {
    expect(wrapper.vm.username).toBe('');
    expect(wrapper.vm.email).toBe('');
    expect(wrapper.vm.password).toBe('');
    expect(wrapper.vm.confirmPassword).toBe('');
  });

  it('表单验证 - 所有字段为空时不能提交', async () => {
    await wrapper.vm.register();

    expect(mockUni.showToast).toHaveBeenCalledWith({
      title: '请填写完整信息',
      icon: 'none'
    });
  });

  it('表单验证 - 密码不一致时不能提交', async () => {
    wrapper.vm.username = 'testuser';
    wrapper.vm.email = 'test@example.com';
    wrapper.vm.password = 'password123';
    wrapper.vm.confirmPassword = 'password456';

    await wrapper.vm.register();

    expect(mockUni.showToast).toHaveBeenCalledWith({
      title: '两次输入的密码不一致',
      icon: 'none'
    });
  });

  it('注册成功时显示成功提示并返回登录页', async () => {
    mockUni.request.mockResolvedValue({
      data: { id: '1', username: 'testuser' }
    });

    wrapper.vm.username = 'testuser';
    wrapper.vm.email = 'test@example.com';
    wrapper.vm.password = 'password123';
    wrapper.vm.confirmPassword = 'password123';

    await wrapper.vm.register();

    expect(mockUni.showToast).toHaveBeenCalledWith({
      title: '注册成功',
      icon: 'success'
    });

    // 等待1.5秒后返回
    jest.advanceTimersByTime(1500);
    expect(mockUni.navigateBack).toHaveBeenCalled();
  });

  it('注册失败时显示错误提示', async () => {
    mockUni.request.mockResolvedValue({
      data: null
    });

    wrapper.vm.username = 'testuser';
    wrapper.vm.email = 'test@example.com';
    wrapper.vm.password = 'password123';
    wrapper.vm.confirmPassword = 'password123';

    await wrapper.vm.register();

    expect(mockUni.showToast).toHaveBeenCalledWith({
      title: '注册失败',
      icon: 'none'
    });
  });

  it('网络错误时显示错误提示', async () => {
    mockUni.request.mockRejectedValue(new Error('网络错误'));

    wrapper.vm.username = 'testuser';
    wrapper.vm.email = 'test@example.com';
    wrapper.vm.password = 'password123';
    wrapper.vm.confirmPassword = 'password123';

    await wrapper.vm.register();

    expect(mockUni.showToast).toHaveBeenCalledWith({
      title: '注册失败，请稍后重试',
      icon: 'none'
    });
  });

  it('点击返回登录按钮返回上一页', () => {
    wrapper.vm.goToLogin();

    expect(mockUni.navigateBack).toHaveBeenCalled();
  });
});
