import Book from '../../models/Book';
import BookService from '../../services/BookService';

describe('Book Model', () => {
  let book;

  beforeEach(() => {
    book = new Book({
      id: '1',
      title: '测试书籍',
      author: '测试作者',
      description: '测试描述'
    });
  });

  it('创建书籍实例', () => {
    expect(book.id).toBe('1');
    expect(book.title).toBe('测试书籍');
    expect(book.author).toBe('测试作者');
    expect(book.description).toBe('测试描述');
  });

  it('更新阅读进度', () => {
    book.updateProgress(50);
    expect(book.readingProgress).toBe(50);
    expect(book.lastReadTime).toBeTruthy();
  });

  it('添加和移除标签', () => {
    book.addTag('科幻');
    expect(book.tags).toContain('科幻');
    book.removeTag('科幻');
    expect(book.tags).not.toContain('科幻');
  });

  it('转换为JSON', () => {
    const json = book.toJSON();
    expect(json.id).toBe('1');
    expect(json.title).toBe('测试书籍');
  });

  it('从JSON创建实例', () => {
    const json = book.toJSON();
    const newBook = Book.fromJSON(json);
    expect(newBook instanceof Book).toBe(true);
    expect(newBook.title).toBe('测试书籍');
  });
});

describe('BookService', () => {
  let bookService;
  let mockUni;
  let storageData;

  beforeEach(() => {
    storageData = {};
    mockUni = {
      getStorageSync: jest.fn(key => storageData[key]),
      setStorageSync: jest.fn((key, value) => {
        storageData[key] = value;
      })
    };
    bookService = new BookService(mockUni);
  });

  it('添加书籍', async () => {
    const book = await bookService.addBook({
      title: '测试书籍',
      author: '测试作者'
    });

    expect(book.title).toBe('测试书籍');
    expect(mockUni.setStorageSync).toHaveBeenCalled();

    const books = await bookService.getBooks();
    expect(books).toHaveLength(1);
    expect(books[0].title).toBe('测试书籍');
  });

  it('更新书籍', async () => {
    const book = await bookService.addBook({
      title: '测试书籍',
      author: '测试作者'
    });

    await bookService.updateBook(book.id, {
      title: '更新后的书籍'
    });

    const updatedBook = await bookService.getBook(book.id);
    expect(updatedBook.title).toBe('更新后的书籍');
  });

  it('删除书籍', async () => {
    const book = await bookService.addBook({
      title: '测试书籍'
    });

    await bookService.deleteBook(book.id);
    const books = await bookService.getBooks();
    expect(books).toHaveLength(0);
  });

  it('更新阅读进度', async () => {
    const book = await bookService.addBook({
      title: '测试书籍'
    });

    await bookService.updateReadingProgress(book.id, 50);
    const updatedBook = await bookService.getBook(book.id);
    expect(updatedBook.readingProgress).toBe(50);
  });

  it('搜索书籍', async () => {
    await bookService.addBook({
      title: '科幻小说',
      author: '作者A'
    });
    await bookService.addBook({
      title: '历史小说',
      author: '作者B'
    });

    const results = await bookService.searchBooks('科幻');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('科幻小说');
  });
});
