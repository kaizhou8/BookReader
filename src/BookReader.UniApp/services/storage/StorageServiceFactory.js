import MobileStorageService from './MobileStorageService';
import PCStorageService from './PCStorageService';

/**
 * 存储服务工厂类
 */
export default class StorageServiceFactory {
  static create(platform, uni) {
    // #ifdef H5
    if (platform === 'pc') {
      return new PCStorageService();
    }
    // #endif

    // #ifdef APP-PLUS || H5
    return new MobileStorageService(uni);
    // #endif
  }
}
