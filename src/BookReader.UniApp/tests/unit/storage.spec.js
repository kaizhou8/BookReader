import MobileStorageService from '../../services/storage/MobileStorageService';
import PCStorageService from '../../services/storage/PCStorageService';
import StorageServiceFactory from '../../services/storage/StorageServiceFactory';

// 模拟 electron 模块
jest.mock('electron', () => ({
  remote: {
    app: {
      getPath: jest.fn(() => '/mock/app/data')
    }
  }
}));

// 模拟 fs 模块
jest.mock('fs', () => {
  const fileData = {};
  return {
    promises: {
      writeFile: jest.fn((path, data) => {
        fileData[path] = data;
        return Promise.resolve();
      }),
      readFile: jest.fn(path => {
        if (!fileData[path]) {
          const error = new Error('文件不存在');
          error.code = 'ENOENT';
          return Promise.reject(error);
        }
        return Promise.resolve(fileData[path]);
      }),
      unlink: jest.fn(path => {
        delete fileData[path];
        return Promise.resolve();
      }),
      readdir: jest.fn(() => {
        return Promise.resolve(Object.keys(fileData));
      }),
      stat: jest.fn(() => {
        return Promise.resolve({
          size: 1024,
          birthtime: new Date(),
          mtime: new Date()
        });
      }),
      access: jest.fn(),
      mkdir: jest.fn()
    },
    existsSync: jest.fn(() => true),
    mkdirSync: jest.fn()
  };
});

// 模拟 path 模块
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  dirname: jest.fn(path => path.split('/').slice(0, -1).join('/')),
  basename: jest.fn(path => path.split('/').pop())
}));

describe('Storage Services', () => {
  describe('MobileStorageService', () => {
    let storage;
    let mockUni;

    beforeEach(() => {
      const storageData = {};
      mockUni = {
        setStorage: jest.fn(({ key, data }) => {
          storageData[key] = data;
          return Promise.resolve();
        }),
        getStorage: jest.fn(({ key }) => {
          return Promise.resolve({ data: storageData[key] });
        }),
        removeStorage: jest.fn(({ key }) => {
          delete storageData[key];
          return Promise.resolve();
        }),
        clearStorage: jest.fn(() => {
          Object.keys(storageData).forEach(key => delete storageData[key]);
          return Promise.resolve();
        }),
        getStorageInfo: jest.fn(() => {
          return Promise.resolve({ keys: Object.keys(storageData) });
        }),
        env: {
          USER_DATA_PATH: '/mock/user/data'
        },
        getFileSystemManager: jest.fn(() => ({
          readFile: jest.fn(),
          writeFile: jest.fn(),
          unlink: jest.fn(),
          stat: jest.fn(),
          access: jest.fn(),
          mkdir: jest.fn()
        }))
      };

      storage = new MobileStorageService(mockUni);
    });

    it('存储和获取数据', async () => {
      const testData = { test: 'data' };
      await storage.set('test', testData);
      const result = await storage.get('test');
      expect(result).toEqual(testData);
    });

    it('删除数据', async () => {
      await storage.set('test', { test: 'data' });
      await storage.remove('test');
      const result = await storage.get('test');
      expect(result).toBeNull();
    });

    it('清除所有数据', async () => {
      await storage.set('test1', { test: 1 });
      await storage.set('test2', { test: 2 });
      await storage.clear();
      const keys = await storage.keys();
      expect(keys).toHaveLength(0);
    });
  });

  describe('PCStorageService', () => {
    let storage;

    beforeEach(() => {
      storage = new PCStorageService();
    });

    it('存储和获取数据', async () => {
      const testData = { test: 'data' };
      await storage.set('test', testData);
      const result = await storage.get('test');
      expect(JSON.parse(result)).toEqual(testData);
    });

    it('删除数据', async () => {
      await storage.set('test', { test: 'data' });
      await storage.remove('test');
      const result = await storage.get('test');
      expect(result).toBeNull();
    });

    it('清除所有数据', async () => {
      await storage.set('test1', { test: 1 });
      await storage.set('test2', { test: 2 });
      await storage.clear();
      const keys = await storage.keys();
      expect(keys).toHaveLength(0);
    });
  });

  describe('StorageServiceFactory', () => {
    it('为PC平台创建PCStorageService', () => {
      const storage = StorageServiceFactory.create('pc');
      expect(storage).toBeInstanceOf(PCStorageService);
    });

    it('为移动平台创建MobileStorageService', () => {
      const mockUni = {};
      const storage = StorageServiceFactory.create('mobile', mockUni);
      expect(storage).toBeInstanceOf(MobileStorageService);
    });
  });
});
