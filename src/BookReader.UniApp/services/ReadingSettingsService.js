import ReadingSettings from '../models/ReadingSettings';

export default class ReadingSettingsService {
  constructor(uni) {
    this.uni = uni;
    this.settings = null;
  }

  // 获取阅读设置
  getSettings() {
    if (this.settings) {
      return this.settings;
    }

    const settings = this.uni.getStorageSync('reading_settings');
    if (settings) {
      this.settings = settings;
      return settings;
    }

    // 如果没有设置，创建默认设置
    this.settings = new ReadingSettings();
    this.saveSettings(this.settings);
    return this.settings;
  }

  // 保存阅读设置
  saveSettings(settings) {
    this.settings = settings;
    this.uni.setStorageSync('reading_settings', settings);
  }

  // 更新字体大小
  updateFontSize(size) {
    const settings = this.getSettings();
    settings.fontSize = size;
    this.saveSettings(settings);
  }

  // 更新行高
  updateLineHeight(height) {
    const settings = this.getSettings();
    settings.lineHeight = height;
    this.saveSettings(settings);
  }

  // 更新主题
  updateTheme(theme) {
    const settings = this.getSettings();
    settings.theme = theme;
    settings.isNightMode = theme === 'night';
    this.saveSettings(settings);
  }

  // 更新字体
  updateFontFamily(fontFamily) {
    const settings = this.getSettings();
    settings.fontFamily = fontFamily;
    this.saveSettings(settings);
  }

  // 更新页面边距
  updateMargin(margin) {
    const settings = this.getSettings();
    settings.margin = margin;
    this.saveSettings(settings);
  }

  // 更新亮度
  updateBrightness(brightness) {
    const settings = this.getSettings();
    settings.brightness = brightness;
    this.saveSettings(settings);
  }

  // 切换夜间模式
  toggleNightMode() {
    const settings = this.getSettings();
    settings.isNightMode = !settings.isNightMode;
    settings.theme = settings.isNightMode ? 'night' : 'default';
    this.saveSettings(settings);
  }

  // 重置为默认设置
  resetSettings() {
    this.settings = new ReadingSettings();
    this.saveSettings(this.settings);
    return this.settings;
  }

  // 获取当前主题的样式
  getCurrentThemeStyle() {
    const settings = this.getSettings();
    return ReadingSettings.themes[settings.theme];
  }
}
