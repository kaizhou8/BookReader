/**
 * Error type enumeration
 */
export const ErrorType = {
  STORAGE_PERMISSION: 'STORAGE_PERMISSION',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  STORAGE_FULL: 'STORAGE_FULL',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Error handling service for managing error messages and user notifications
 */
export default class ErrorHandlingService {
  constructor(uni) {
    this.uni = uni;
    this.errorMessages = {
      [ErrorType.STORAGE_PERMISSION]: 'Storage permission required, please allow access in settings',
      [ErrorType.FILE_NOT_FOUND]: 'File not found or has been deleted',
      [ErrorType.FILE_TOO_LARGE]: 'File too large, please select a file less than 100MB',
      [ErrorType.INVALID_FILE_TYPE]: 'Unsupported file type',
      [ErrorType.STORAGE_FULL]: 'Storage space insufficient, please clear some space and try again',
      [ErrorType.NETWORK_ERROR]: 'Network connection failed, please check your network settings',
      [ErrorType.UNKNOWN_ERROR]: 'Operation failed, please try again later'
    };
  }

  /**
   * Handle file operation errors
   * @param {Error} error - Error object
   * @param {Object} options - Configuration options
   * @returns {string} Error type
   */
  handleFileError(error, options = {}) {
    let errorType = ErrorType.UNKNOWN_ERROR;
    const errorMessage = error.message.toLowerCase();

    // Determine error type
    if (errorMessage.includes('permission') || errorMessage.includes('access')) {
      errorType = ErrorType.STORAGE_PERMISSION;
    } else if (errorMessage.includes('not found') || errorMessage.includes('missing')) {
      errorType = ErrorType.FILE_NOT_FOUND;
    } else if (errorMessage.includes('too large') || errorMessage.includes('size')) {
      errorType = ErrorType.FILE_TOO_LARGE;
    } else if (errorMessage.includes('type') || errorMessage.includes('format')) {
      errorType = ErrorType.INVALID_FILE_TYPE;
    } else if (errorMessage.includes('storage full') || errorMessage.includes('quota')) {
      errorType = ErrorType.STORAGE_FULL;
    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      errorType = ErrorType.NETWORK_ERROR;
    }

    // Show error notification
    this.showError(errorType, options);

    return errorType;
  }

  /**
   * Display error notification
   * @param {string} errorType - Error type
   * @param {Object} options - Configuration options
   */
  showError(errorType, options = {}) {
    const message = this.errorMessages[errorType] || this.errorMessages[ErrorType.UNKNOWN_ERROR];
    const {
      showModal = false,
      modalTitle = 'Prompt',
      modalButtons = [],
      duration = 2000
    } = options;

    if (showModal) {
      this.uni.showModal({
        title: modalTitle,
        content: message,
        ...this.getModalButtons(errorType, modalButtons)
      });
    } else {
      this.uni.showToast({
        title: message,
        icon: 'none',
        duration
      });
    }
  }

  /**
   * Get modal button configuration
   * @private
   */
  getModalButtons(errorType, customButtons) {
    // Use custom buttons if provided
    if (customButtons.length > 0) {
      return {
        showCancel: customButtons.length > 1,
        cancelText: customButtons[1]?.text || 'Cancel',
        confirmText: customButtons[0]?.text || 'OK',
        success: (res) => {
          if (res.confirm && customButtons[0]?.callback) {
            customButtons[0].callback();
          } else if (res.cancel && customButtons[1]?.callback) {
            customButtons[1].callback();
          }
        }
      };
    }

    // Default buttons for storage permission
    if (errorType === ErrorType.STORAGE_PERMISSION) {
      return {
        showCancel: true,
        cancelText: 'Cancel',
        confirmText: 'Go to settings',
        success: (res) => {
          if (res.confirm) {
            // Open app settings
            this.openAppSettings();
          }
        }
      };
    }

    // Default buttons for other errors
    return {
      showCancel: false,
      confirmText: 'OK'
    };
  }

  /**
   * Check file size
   * @param {File|Blob|ArrayBuffer} file - File to check
   * @param {number} maxSize - Maximum allowed size in bytes
   * @throws {Error} If file size exceeds limit
   */
  checkFileSize(file, maxSize) {
    let size = 0;

    if (file instanceof ArrayBuffer) {
      size = file.byteLength;
    } else if (file instanceof Blob) {
      size = file.size;
    } else if (file && typeof file.size === 'number') {
      size = file.size;
    }

    if (size > maxSize) {
      throw new Error('File too large');
    }
  }

  /**
   * Check file type
   * @param {string} filename - File name
   * @param {string[]} allowedTypes - List of allowed file extensions
   * @throws {Error} If file type is not supported
   */
  checkFileType(filename, allowedTypes) {
    const extension = filename.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(extension.toLowerCase())) {
      throw new Error('Unsupported file type');
    }
  }

  /**
   * Open app settings
   * @private
   */
  openAppSettings() {
    // Get system info
    const systemInfo = this.uni.getSystemInfoSync();
    
    if (systemInfo.platform === 'android') {
      // Open Android app settings
      this.uni.navigateTo({
        url: 'package:' + this.getPackageName()
      });
    } else if (systemInfo.platform === 'ios') {
      // Open iOS app settings
      this.uni.openSetting();
    }
  }

  /**
   * Get package name
   * @private
   */
  getPackageName() {
    return 'com.example.bookreader';
  }
}
