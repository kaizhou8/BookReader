export default class Bookmark {
  constructor(bookId, chapterId, position, content, note, timestamp) {
    this.bookId = bookId;           // 书籍ID
    this.chapterId = chapterId;     // 章节ID
    this.position = position;        // 书签位置（百分比）
    this.content = content;         // 书签内容（摘录）
    this.note = note;               // 笔记
    this.timestamp = timestamp;      // 创建时间
  }
}
