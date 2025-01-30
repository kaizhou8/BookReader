import Book from '../models/Book';
import StorageServiceFactory from './storage/StorageServiceFactory';
import PermissionService from './PermissionService';
import ErrorHandlingService, { ErrorType } from './ErrorHandlingService';

/**
 * Service for managing books, including CRUD operations and file handling
 */
export default class BookService {
  constructor(uni) {
    this.uni = uni;
    let platform = 'mobile';
    // #ifdef H5
    if (process.env.UNI_PLATFORM === 'h5' && window.electron) {
      platform = 'pc';
    }
    // #endif

    this.storage = StorageServiceFactory.create(platform, uni);
    this.permissionService = new PermissionService(uni);
    this.errorHandling = new ErrorHandlingService(uni);
    this.STORAGE_KEY = 'books';
    this.CATEGORIES_KEY = 'book_categories';
    this.TAGS_KEY = 'book_tags';
  }

  /**
   * Handle file operation errors
   * @private
   * @param {Error} error - Error object
   * @param {Object} options - Configuration options
   * @throws {Error} Rethrows the error after handling
   */
  async handleFileOperationError(error, options = {}) {
    const errorType = this.errorHandling.handleFileError(error, {
      showModal: true,
      modalButtons: [
        { text: 'Go to settings', action: 'openSettings' },
        { text: 'Cancel', action: 'cancel' }
      ],
      ...options
    });

    if (errorType === ErrorType.STORAGE_PERMISSION && options.onPermissionDenied) {
      await options.onPermissionDenied();
    }

    throw error;
  }

  /**
   * Handle storage permission errors
   * @private
   * @param {Error} error - Error object
   * @throws {Error} Rethrows the error after handling
   */
  handleStoragePermissionError(error) {
    if (error.message.includes('storage permission')) {
      this.uni.showModal({
        title: 'Storage permission required',
        content: 'Please allow storage access in settings',
        confirmText: 'Go to settings',
        cancelText: 'Cancel',
        success: (res) => {
          if (res.confirm) {
            this.permissionService.openAppSettings();
          }
        }
      });
    }
    throw error;
  }

  /**
   * Get all books
   * @returns {Promise<Book[]>} List of books
   */
  async getBooks() {
    try {
      const booksData = await this.storage.get(this.STORAGE_KEY) || [];
      return booksData.map(data => Book.fromJSON(data));
    } catch (error) {
      await this.handleFileOperationError(error, {
        onPermissionDenied: () => this.permissionService.openAppSettings()
      });
      return [];
    }
  }

  /**
   * Get a single book by ID
   * @param {string} id - Book ID
   * @returns {Promise<Book|null>} Book object or null if not found
   */
  async getBook(id) {
    try {
      const books = await this.getBooks();
      return books.find(book => book.id === id);
    } catch (error) {
      await this.handleFileOperationError(error);
      return null;
    }
  }

  /**
   * Add a new book
   * @param {Object} bookData - Book data including file if present
   * @returns {Promise<Book>} Added book
   * @throws {Error} If operation fails
   */
  async addBook(bookData) {
    try {
      const books = await this.getBooks();
      const newBook = new Book({
        id: Date.now().toString(),
        ...bookData
      });

      // Save file if present
      if (bookData.file) {
        // Check file size
        if (bookData.file.size > 100 * 1024 * 1024) { // 100MB
          throw new Error('File is too large');
        }

        const filePath = `${newBook.id}/${bookData.file.name}`;
        newBook.filePath = await this.storage.saveFile(filePath, bookData.file);
      }

      books.push(newBook);
      await this.storage.set(this.STORAGE_KEY, books.map(book => book.toJSON()));
      return newBook;
    } catch (error) {
      await this.handleFileOperationError(error, {
        modalTitle: 'Failed to add book'
      });
      throw error;
    }
  }

  /**
   * Update a book
   * @param {string} id - Book ID
   * @param {Object} bookData - Updated book data
   * @returns {Promise<Book>} Updated book
   * @throws {Error} If operation fails
   */
  async updateBook(id, bookData) {
    try {
      const books = await this.getBooks();
      const index = books.findIndex(book => book.id === id);
      if (index === -1) {
        throw new Error('Book not found');
      }

      // Delete old file if present
      if (bookData.file && books[index].filePath) {
        await this.storage.deleteFile(books[index].filePath);
      }

      // Save new file
      if (bookData.file) {
        const filePath = `${id}/${bookData.file.name}`;
        bookData.filePath = await this.storage.saveFile(filePath, bookData.file);
      }

      books[index].update(bookData);
      await this.storage.set(this.STORAGE_KEY, books.map(book => book.toJSON()));
      return books[index];
    } catch (error) {
      await this.handleFileOperationError(error);
      throw error;
    }
  }

  /**
   * Delete a book
   * @param {string} id - Book ID
   * @throws {Error} If operation fails
   */
  async deleteBook(id) {
    try {
      const books = await this.getBooks();
      const book = books.find(book => book.id === id);
      if (book && book.filePath) {
        await this.storage.deleteFile(book.filePath);
      }

      const newBooks = books.filter(book => book.id !== id);
      await this.storage.set(this.STORAGE_KEY, newBooks.map(book => book.toJSON()));
    } catch (error) {
      await this.handleFileOperationError(error);
      throw error;
    }
  }

  /**
   * Delete multiple books
   * @param {string[]} ids - Array of book IDs
   * @throws {Error} If operation fails
   */
  async deleteBooks(ids) {
    try {
      const books = await this.getBooks();
      
      // Delete files
      await Promise.all(
        books
          .filter(book => ids.includes(book.id) && book.filePath)
          .map(book => this.storage.deleteFile(book.filePath))
      );

      const newBooks = books.filter(book => !ids.includes(book.id));
      await this.storage.set(this.STORAGE_KEY, newBooks.map(book => book.toJSON()));
    } catch (error) {
      await this.handleFileOperationError(error);
      throw error;
    }
  }

  /**
   * Update reading progress
   * @param {string} id - Book ID
   * @param {number} progress - Reading progress
   * @returns {Promise<Book>} Updated book
   * @throws {Error} If operation fails
   */
  async updateReadingProgress(id, progress) {
    try {
      const books = await this.getBooks();
      const book = books.find(book => book.id === id);
      if (!book) {
        throw new Error('Book not found');
      }
      book.updateProgress(progress);
      await this.storage.set(this.STORAGE_KEY, books.map(book => book.toJSON()));
      return book;
    } catch (error) {
      await this.handleFileOperationError(error);
      throw error;
    }
  }

  /**
   * Get all categories
   * @returns {Promise<string[]>} List of categories
   */
  async getCategories() {
    try {
      return await this.storage.get(this.CATEGORIES_KEY) || [];
    } catch (error) {
      await this.handleFileOperationError(error);
      return [];
    }
  }

  /**
   * Add a category
   * @param {string} category - Category name
   * @returns {Promise<string[]>} List of categories
   * @throws {Error} If operation fails
   */
  async addCategory(category) {
    try {
      const categories = await this.getCategories();
      if (!categories.includes(category)) {
        categories.push(category);
        await this.storage.set(this.CATEGORIES_KEY, categories);
      }
      return categories;
    } catch (error) {
      await this.handleFileOperationError(error);
      throw error;
    }
  }

  /**
   * Get all tags
   * @returns {Promise<string[]>} List of tags
   */
  async getTags() {
    try {
      return await this.storage.get(this.TAGS_KEY) || [];
    } catch (error) {
      await this.handleFileOperationError(error);
      return [];
    }
  }

  /**
   * Add a tag
   * @param {string} tag - Tag name
   * @returns {Promise<string[]>} List of tags
   * @throws {Error} If operation fails
   */
  async addTag(tag) {
    try {
      const tags = await this.getTags();
      if (!tags.includes(tag)) {
        tags.push(tag);
        await this.storage.set(this.TAGS_KEY, tags);
      }
      return tags;
    } catch (error) {
      await this.handleFileOperationError(error);
      throw error;
    }
  }

  /**
   * Get books by category
   * @param {string} category - Category name
   * @returns {Promise<Book[]>} List of books
   */
  async getBooksByCategory(category) {
    try {
      const books = await this.getBooks();
      return books.filter(book => book.categories.includes(category));
    } catch (error) {
      await this.handleFileOperationError(error);
      return [];
    }
  }

  /**
   * Get books by tag
   * @param {string} tag - Tag name
   * @returns {Promise<Book[]>} List of books
   */
  async getBooksByTag(tag) {
    try {
      const books = await this.getBooks();
      return books.filter(book => book.tags.includes(tag));
    } catch (error) {
      await this.handleFileOperationError(error);
      return [];
    }
  }

  /**
   * Search books
   * @param {string} keyword - Search keyword
   * @returns {Promise<Book[]>} List of books
   */
  async searchBooks(keyword) {
    try {
      const books = await this.getBooks();
      const lowerKeyword = keyword.toLowerCase();
      return books.filter(book => 
        (book.title || '').toLowerCase().includes(lowerKeyword) ||
        (book.author || '').toLowerCase().includes(lowerKeyword) ||
        (book.description || '').toLowerCase().includes(lowerKeyword) ||
        (book.tags || []).some(tag => tag.toLowerCase().includes(lowerKeyword))
      );
    } catch (error) {
      await this.handleFileOperationError(error);
      return [];
    }
  }

  /**
   * Sync books with server
   * @returns {Promise<Book[]>} List of synced books
   * @throws {Error} If operation fails
   */
  async syncBooks() {
    try {
      // Get local books
      const localBooks = await this.getBooks();
      
      // Get server books
      const response = await this.uni.request({
        url: '/api/books/sync',
        method: 'POST',
        data: localBooks.map(book => book.toJSON())
      });

      // Update local data
      if (response.data) {
        const serverBooks = response.data.map(data => Book.fromJSON(data));
        await this.storage.set(this.STORAGE_KEY, serverBooks.map(book => book.toJSON()));
        return serverBooks;
      }

      return localBooks;
    } catch (error) {
      await this.handleFileOperationError(error);
      throw error;
    }
  }
}
