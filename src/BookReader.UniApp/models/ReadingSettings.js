export default class ReadingSettings {
  constructor() {
    this.fontSize = 16;             // 字体大小
    this.lineHeight = 1.5;          // 行高
    this.theme = 'default';         // 主题（default, night, paper, sepia）
    this.fontFamily = 'system';     // 字体
    this.margin = 16;               // 页面边距
    this.brightness = 100;          // 亮度（0-100）
    this.isNightMode = false;       // 夜间模式
  }

  // 预定义主题
  static themes = {
    default: {
      background: '#ffffff',
      color: '#333333'
    },
    night: {
      background: '#1a1a1a',
      color: '#cccccc'
    },
    paper: {
      background: '#f4ecd8',
      color: '#333333'
    },
    sepia: {
      background: '#faf4e8',
      color: '#5b4636'
    }
  };
}
