/**
 * 权限管理服务
 */
export default class PermissionService {
  constructor(uni) {
    this.uni = uni;
  }

  /**
   * 检查并申请存储权限
   * @returns {Promise<boolean>} 是否获得权限
   */
  async requestStoragePermission() {
    // #ifdef APP-PLUS
    const status = await this.checkStoragePermission();
    if (status === 1) {
      return true;
    }

    try {
      const result = await this.requestAndroidPermission(
        'android.permission.WRITE_EXTERNAL_STORAGE'
      );
      return result.granted;
    } catch (error) {
      console.error('申请存储权限失败:', error);
      return false;
    }
    // #endif

    // #ifdef H5
    return true; // H5环境下默认已有权限
    // #endif
  }

  /**
   * 检查存储权限状态
   * @returns {Promise<number>} 0: 未申请, 1: 已允许, 2: 已拒绝
   */
  async checkStoragePermission() {
    // #ifdef APP-PLUS
    try {
      const result = await this.checkAndroidPermission(
        'android.permission.WRITE_EXTERNAL_STORAGE'
      );
      if (result.granted) {
        return 1;
      }
      return result.deniedAlways ? 2 : 0;
    } catch (error) {
      console.error('检查存储权限失败:', error);
      return 0;
    }
    // #endif

    // #ifdef H5
    return 1; // H5环境下默认已有权限
    // #endif
  }

  /**
   * 检查Android权限
   * @private
   */
  checkAndroidPermission(permission) {
    return new Promise((resolve, reject) => {
      plus.android.requestPermissions(
        [permission],
        function(resultObj) {
          resolve(resultObj);
        },
        function(error) {
          reject(error);
        }
      );
    });
  }

  /**
   * 申请Android权限
   * @private
   */
  requestAndroidPermission(permission) {
    return new Promise((resolve, reject) => {
      plus.android.requestPermissions(
        [permission],
        function(resultObj) {
          resolve(resultObj);
        },
        function(error) {
          reject(error);
        }
      );
    });
  }

  /**
   * 打开应用设置页面
   */
  openAppSettings() {
    // #ifdef APP-PLUS
    if (this.uni.getSystemInfoSync().platform === 'android') {
      const main = plus.android.runtimeMainActivity();
      const Intent = plus.android.importClass('android.content.Intent');
      const Settings = plus.android.importClass('android.provider.Settings');
      const Uri = plus.android.importClass('android.net.Uri');
      const intent = new Intent();
      intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
      const uri = Uri.fromParts('package', main.getPackageName(), null);
      intent.setData(uri);
      main.startActivity(intent);
    } else if (this.uni.getSystemInfoSync().platform === 'ios') {
      const UIApplication = plus.ios.import('UIApplication');
      const NSURL = plus.ios.import('NSURL');
      const settingsUrl = NSURL.URLWithString('app-settings:');
      const application = UIApplication.sharedApplication();
      application.openURL(settingsUrl);
    }
    // #endif
  }
}
