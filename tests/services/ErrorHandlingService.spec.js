import { describe, it, expect, beforeEach, vi } from 'vitest';
import ErrorHandlingService, { ErrorType } from '../../src/BookReader.UniApp/services/ErrorHandlingService';

describe('ErrorHandlingService', () => {
  let service;
  let mockUni;

  beforeEach(() => {
    mockUni = {
      showToast: vi.fn(),
      showModal: vi.fn(),
      openSetting: vi.fn()
    };
    service = new ErrorHandlingService(mockUni);
  });

  describe('handleFileError', () => {
    it('should identify storage permission error', () => {
      const error = new Error('Storage permission denied');
      const errorType = service.handleFileError(error);
      expect(errorType).toBe(ErrorType.STORAGE_PERMISSION);
      expect(mockUni.showToast).toHaveBeenCalled();
    });

    it('should identify file not found error', () => {
      const error = new Error('File not found');
      const errorType = service.handleFileError(error);
      expect(errorType).toBe(ErrorType.FILE_NOT_FOUND);
      expect(mockUni.showToast).toHaveBeenCalled();
    });

    it('should identify file too large error', () => {
      const error = new Error('File is too large');
      const errorType = service.handleFileError(error);
      expect(errorType).toBe(ErrorType.FILE_TOO_LARGE);
      expect(mockUni.showToast).toHaveBeenCalled();
    });

    it('should return unknown error for unrecognized error messages', () => {
      const error = new Error('Some random error');
      const errorType = service.handleFileError(error);
      expect(errorType).toBe(ErrorType.UNKNOWN_ERROR);
      expect(mockUni.showToast).toHaveBeenCalled();
    });
  });

  describe('showError', () => {
    it('should show toast by default', () => {
      service.showError(ErrorType.FILE_NOT_FOUND);
      expect(mockUni.showToast).toHaveBeenCalledWith({
        title: expect.any(String),
        icon: 'none',
        duration: 2000
      });
    });

    it('should show modal when specified', () => {
      service.showError(ErrorType.STORAGE_PERMISSION, { showModal: true });
      expect(mockUni.showModal).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.any(String),
        content: expect.any(String)
      }));
    });

    it('should use custom buttons in modal', () => {
      const customButtons = [
        { text: 'Custom OK', action: 'custom' },
        { text: 'Custom Cancel', action: 'cancel' }
      ];
      service.showError(ErrorType.FILE_TOO_LARGE, {
        showModal: true,
        modalButtons: customButtons
      });
      expect(mockUni.showModal).toHaveBeenCalledWith(expect.objectContaining({
        confirmText: 'Custom OK',
        cancelText: 'Custom Cancel'
      }));
    });
  });

  describe('checkFileSize', () => {
    const maxSize = 100 * 1024 * 1024; // 100MB

    it('should throw error when file size exceeds limit', () => {
      const file = { size: 150 * 1024 * 1024 }; // 150MB
      expect(() => service.checkFileSize(file, maxSize)).toThrow('File is too large');
    });

    it('should not throw error when file size is within limit', () => {
      const file = { size: 50 * 1024 * 1024 }; // 50MB
      expect(() => service.checkFileSize(file, maxSize)).not.toThrow();
    });
  });

  describe('checkFileType', () => {
    const allowedTypes = ['.pdf', '.epub'];

    it('should throw error for unsupported file type', () => {
      expect(() => service.checkFileType('test.xyz', allowedTypes))
        .toThrow('Unsupported file type');
    });

    it('should not throw error for supported file type', () => {
      expect(() => service.checkFileType('test.pdf', allowedTypes))
        .not.toThrow();
    });
  });
});
