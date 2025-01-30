import { describe, it, expect, beforeEach, vi } from 'vitest';
import ErrorHandlingService, { ErrorType } from '@/services/ErrorHandlingService';

describe('ErrorHandlingService', () => {
  let service;
  let mockUni;

  beforeEach(() => {
    mockUni = {
      showToast: vi.fn(),
      showModal: vi.fn(),
      getSystemInfoSync: vi.fn(() => ({
        platform: 'android'
      })),
      navigateTo: vi.fn()
    };
    service = new ErrorHandlingService(mockUni);
  });

  describe('handleFileError', () => {
    it('should correctly identify storage permission error', () => {
      const error = new Error('Permission denied');
      error.code = 'PERMISSION_DENIED';
      const errorType = service.handleFileError(error);
      expect(errorType).toBe(ErrorType.STORAGE_PERMISSION);
      expect(mockUni.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Storage permission'),
          icon: 'none',
          duration: 2000
        })
      );
    });

    it('should correctly identify file not found error', () => {
      const error = new Error('File not found');
      error.code = 'FILE_NOT_FOUND';
      const errorType = service.handleFileError(error);
      expect(errorType).toBe(ErrorType.FILE_NOT_FOUND);
      expect(mockUni.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('File not found'),
          icon: 'none',
          duration: 2000
        })
      );
    });

    it('should correctly identify file too large error', () => {
      const error = new Error('File too large');
      error.code = 'FILE_TOO_LARGE';
      const errorType = service.handleFileError(error);
      expect(errorType).toBe(ErrorType.FILE_TOO_LARGE);
      expect(mockUni.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('File too large'),
          icon: 'none',
          duration: 2000
        })
      );
    });

    it('should correctly identify invalid file type error', () => {
      const error = new Error('Invalid file type');
      error.code = 'INVALID_FILE_TYPE';
      const errorType = service.handleFileError(error);
      expect(errorType).toBe(ErrorType.INVALID_FILE_TYPE);
      expect(mockUni.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Unsupported file type'),
          icon: 'none',
          duration: 2000
        })
      );
    });

    it('should correctly identify storage quota exceeded error', () => {
      const error = new Error('Storage quota exceeded');
      error.code = 'QUOTA_EXCEEDED';
      const errorType = service.handleFileError(error);
      expect(errorType).toBe(ErrorType.STORAGE_FULL);
      expect(mockUni.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Storage space insufficient'),
          icon: 'none',
          duration: 2000
        })
      );
    });

    it('should correctly identify network error', () => {
      const error = new Error('Network error');
      error.code = 'NETWORK_ERROR';
      const errorType = service.handleFileError(error);
      expect(errorType).toBe(ErrorType.NETWORK_ERROR);
      expect(mockUni.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Network'),
          icon: 'none',
          duration: 2000
        })
      );
    });

    it('should handle unknown error', () => {
      const error = new Error('Unknown error');
      const errorType = service.handleFileError(error);
      expect(errorType).toBe(ErrorType.UNKNOWN_ERROR);
      expect(mockUni.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Operation failed'),
          icon: 'none',
          duration: 2000
        })
      );
    });
  });

  describe('showError', () => {
    it('should show Toast prompt', () => {
      service.showError(ErrorType.FILE_NOT_FOUND);
      expect(mockUni.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('File not found'),
          icon: 'none',
          duration: 2000
        })
      );
    });

    it('should show Modal prompt', () => {
      service.showError(ErrorType.STORAGE_PERMISSION, { showModal: true });
      expect(mockUni.showModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Prompt',
          content: expect.stringContaining('Storage permission'),
          showCancel: true,
          confirmText: 'Go to settings'
        })
      );
    });

    it('should support custom Modal buttons', () => {
      const customCallback = vi.fn();
      service.showError(ErrorType.FILE_NOT_FOUND, {
        showModal: true,
        modalButtons: [
          { text: 'Retry', callback: customCallback }
        ]
      });
      expect(mockUni.showModal).toHaveBeenCalledWith(
        expect.objectContaining({
          showCancel: false,
          confirmText: 'Retry'
        })
      );
    });
  });

  describe('checkFileSize', () => {
    it('should check file size - ArrayBuffer', () => {
      const buffer = new ArrayBuffer(1024 * 1024); // 1MB
      expect(() => service.checkFileSize(buffer, 512 * 1024)) // 512KB limit
        .toThrow('File too large');
    });

    it('should check file size - Blob', () => {
      const blob = new Blob(['test'], { type: 'text/plain' });
      expect(() => service.checkFileSize(blob, 1)) // 1 byte limit
        .toThrow('File too large');
    });

    it('should pass valid file size check', () => {
      const file = { size: 50 * 1024 }; // 50KB
      expect(() => service.checkFileSize(file, 100 * 1024)) // 100KB limit
        .not.toThrow();
    });
  });

  describe('checkFileType', () => {
    it('should check unsupported file type', () => {
      expect(() => service.checkFileType('test.xyz', ['pdf', 'epub']))
        .toThrow('Unsupported file type');
    });

    it('should pass supported file type', () => {
      expect(() => service.checkFileType('test.pdf', ['pdf', 'epub']))
        .not.toThrow();
    });

    it('should ignore file extension case', () => {
      expect(() => service.checkFileType('test.PDF', ['pdf', 'epub']))
        .not.toThrow();
    });
  });
});
