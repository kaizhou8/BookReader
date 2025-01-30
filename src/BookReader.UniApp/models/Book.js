export default class Book {
  constructor({
    id,
    title,
    author,
    coverUrl,
    description,
    format,
    fileSize,
    filePath,
    chapters,
    categories = [],
    tags = [],
    readingProgress = 0,
    lastReadTime = null,
    createTime = Date.now(),
    updateTime = Date.now()
  }) {
    this.id = id;                     // 书籍ID
    this.title = title;               // 书名
    this.author = author;             // 作者
    this.coverUrl = coverUrl;         // 封面URL
    this.description = description;    // 描述
    this.format = format;             // 文件格式（txt, epub, pdf）
    this.fileSize = fileSize;         // 文件大小（字节）
    this.filePath = filePath;         // 文件路径
    this.chapters = chapters || [];    // 章节列表
    this.categories = categories;      // 分类
    this.tags = tags;                 // 标签
    this.readingProgress = readingProgress;  // 阅读进度（0-100）
    this.lastReadTime = lastReadTime; // 最后阅读时间
    this.createTime = createTime;     // 创建时间
    this.updateTime = updateTime;     // 更新时间
  }

  // 更新阅读进度
  updateProgress(progress) {
    this.readingProgress = Math.min(Math.max(progress, 0), 100);
    this.lastReadTime = Date.now();
    this.updateTime = Date.now();
  }

  // 添加分类
  addCategory(category) {
    if (!this.categories.includes(category)) {
      this.categories.push(category);
      this.updateTime = Date.now();
    }
  }

  // 添加标签
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updateTime = Date.now();
    }
  }

  // 移除标签
  removeTag(tag) {
    const index = this.tags.indexOf(tag);
    if (index !== -1) {
      this.tags.splice(index, 1);
      this.updateTime = Date.now();
    }
  }

  // 更新基本信息
  update(data) {
    Object.assign(this, {
      ...data,
      updateTime: Date.now()
    });
  }

  // 转换为JSON对象
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      coverUrl: this.coverUrl,
      description: this.description,
      format: this.format,
      fileSize: this.fileSize,
      filePath: this.filePath,
      chapters: this.chapters,
      categories: this.categories,
      tags: this.tags,
      readingProgress: this.readingProgress,
      lastReadTime: this.lastReadTime,
      createTime: this.createTime,
      updateTime: this.updateTime
    };
  }

  // 从JSON对象创建实例
  static fromJSON(json) {
    return new Book(json);
  }
}
