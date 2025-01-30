export default class ReadingProgress {
  constructor(bookId, chapterId, position, timestamp) {
    this.bookId = bookId;           // 书籍ID
    this.chapterId = chapterId;     // 章节ID
    this.position = position;        // 阅读位置（百分比）
    this.timestamp = timestamp;      // 最后阅读时间
  }
}
