import { describe, it, expect, beforeEach, vi } from 'vitest';
import BookService from '../../src/BookReader.UniApp/services/BookService';
import { ErrorType } from '../../src/BookReader.UniApp/services/ErrorHandlingService';

// Mock StorageServiceFactory
vi.mock('../../src/BookReader.UniApp/services/storage/StorageServiceFactory', () => ({
  default: {
    create: () => ({
      get: vi.fn(),
      set: vi.fn(),
      saveFile: vi.fn(),
      deleteFile: vi.fn()
    })
  }
}));

// Mock PermissionService
vi.mock('../../src/BookReader.UniApp/services/PermissionService', () => {
  return {
    default: class MockPermissionService {
      constructor() {}
      openAppSettings() {}
    }
  };
});

describe('BookService', () => {
  let service;
  let mockUni;
  let mockStorage;

  beforeEach(() => {
    mockUni = {
      showToast: vi.fn(),
      showModal: vi.fn(),
      request: vi.fn(),
      getSystemInfoSync: vi.fn().mockReturnValue({ platform: 'android' })
    };
    service = new BookService(mockUni);
    mockStorage = service.storage;
  });

  describe('getBooks', () => {
    it('should return empty array when no books exist', async () => {
      mockStorage.get.mockResolvedValue(null);
      const books = await service.getBooks();
      expect(books).toEqual([]);
    });

    it('should handle storage permission error', async () => {
      mockStorage.get.mockRejectedValue(new Error('Storage permission denied'));
      const books = await service.getBooks();
      expect(books).toEqual([]);
      expect(mockUni.showModal).toHaveBeenCalled();
    });

    it('should return books when they exist', async () => {
      const mockBooks = [
        { id: '1', title: 'Book 1', progress: 0 },
        { id: '2', title: 'Book 2', progress: 0 }
      ];
      mockStorage.get.mockResolvedValue(mockBooks);
      const books = await service.getBooks();
      expect(books).toHaveLength(2);
      expect(books[0].id).toBe('1');
    });
  });

  describe('addBook', () => {
    it('should add book without file', async () => {
      const bookData = { title: 'New Book' };
      mockStorage.get.mockResolvedValue([]);
      mockStorage.set.mockResolvedValue();

      const newBook = await service.addBook(bookData);
      expect(newBook.title).toBe('New Book');
      expect(mockStorage.set).toHaveBeenCalled();
    });

    it('should handle file too large error', async () => {
      const bookData = {
        title: 'Book with Large File',
        file: { size: 200 * 1024 * 1024, name: 'large.pdf' }
      };
      mockStorage.get.mockResolvedValue([]);

      await expect(service.addBook(bookData)).rejects.toThrow();
      expect(mockUni.showModal).toHaveBeenCalled();
    });

    it('should save file when adding book with valid file', async () => {
      const bookData = {
        title: 'Book with File',
        file: { size: 50 * 1024 * 1024, name: 'book.pdf' }
      };
      mockStorage.get.mockResolvedValue([]);
      mockStorage.saveFile.mockResolvedValue('path/to/file.pdf');
      mockStorage.set.mockResolvedValue();

      const newBook = await service.addBook(bookData);
      expect(newBook.filePath).toBe('path/to/file.pdf');
      expect(mockStorage.saveFile).toHaveBeenCalled();
    });
  });

  describe('updateBook', () => {
    it('should throw error when book not found', async () => {
      mockStorage.get.mockResolvedValue([]);
      await expect(service.updateBook('999', {}))
        .rejects.toThrow('Book not found');
    });

    it('should update book properties', async () => {
      const existingBooks = [
        { id: '1', title: 'Old Title', progress: 0 }
      ];
      mockStorage.get.mockResolvedValue(existingBooks);
      mockStorage.set.mockResolvedValue();

      const updatedBook = await service.updateBook('1', { title: 'New Title' });
      expect(updatedBook.title).toBe('New Title');
      expect(mockStorage.set).toHaveBeenCalled();
    });

    it('should handle file update', async () => {
      const existingBooks = [
        { id: '1', title: 'Book', filePath: 'old/path.pdf', progress: 0 }
      ];
      mockStorage.get.mockResolvedValue(existingBooks);
      mockStorage.deleteFile.mockResolvedValue();
      mockStorage.saveFile.mockResolvedValue('new/path.pdf');
      mockStorage.set.mockResolvedValue();

      const updatedBook = await service.updateBook('1', {
        title: 'Updated Book',
        file: { size: 50 * 1024 * 1024, name: 'new.pdf' }
      });

      expect(mockStorage.deleteFile).toHaveBeenCalledWith('old/path.pdf');
      expect(mockStorage.saveFile).toHaveBeenCalled();
      expect(updatedBook.filePath).toBe('new/path.pdf');
    });
  });

  describe('deleteBook', () => {
    it('should delete book and its file', async () => {
      const existingBooks = [
        { id: '1', title: 'Book to Delete', filePath: 'path/to/delete.pdf', progress: 0 }
      ];
      mockStorage.get.mockResolvedValue(existingBooks);
      mockStorage.deleteFile.mockResolvedValue();
      mockStorage.set.mockResolvedValue();

      await service.deleteBook('1');
      expect(mockStorage.deleteFile).toHaveBeenCalledWith('path/to/delete.pdf');
      expect(mockStorage.set).toHaveBeenCalledWith(service.STORAGE_KEY, []);
    });

    it('should handle non-existent book deletion', async () => {
      mockStorage.get.mockResolvedValue([]);
      await service.deleteBook('999');
      expect(mockStorage.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('searchBooks', () => {
    it('should find books by title', async () => {
      const mockBooks = [
        { id: '1', title: 'Programming Book', progress: 0 },
        { id: '2', title: 'Cooking Book', progress: 0 }
      ];
      mockStorage.get.mockResolvedValue(mockBooks);

      const results = await service.searchBooks('Programming');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Programming Book');
    });

    it('should find books by tag', async () => {
      const mockBooks = [
        { id: '1', title: 'Book 1', tags: ['programming'], progress: 0 },
        { id: '2', title: 'Book 2', tags: ['cooking'], progress: 0 }
      ];
      mockStorage.get.mockResolvedValue(mockBooks);

      const results = await service.searchBooks('programming');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Book 1');
    });
  });
});
