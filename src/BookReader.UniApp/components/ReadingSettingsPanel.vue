<template>
  <view class="settings-panel" :class="{ 'settings-panel--visible': visible }">
    <view class="settings-panel__header">
      <text class="settings-panel__title">阅读设置</text>
      <text class="settings-panel__close" @tap="close">×</text>
    </view>
    
    <view class="settings-panel__content">
      <!-- 字体大小设置 -->
      <view class="settings-item">
        <text class="settings-item__label">字体大小</text>
        <view class="settings-item__control">
          <text class="control-btn" @tap="decreaseFontSize">A-</text>
          <text class="font-size-value">{{ settings.fontSize }}</text>
          <text class="control-btn" @tap="increaseFontSize">A+</text>
        </view>
      </view>

      <!-- 行高设置 -->
      <view class="settings-item">
        <text class="settings-item__label">行高</text>
        <slider 
          :value="settings.lineHeight * 10"
          :min="10"
          :max="20"
          :step="1"
          @change="onLineHeightChange"
        />
      </view>

      <!-- 主题设置 -->
      <view class="settings-item">
        <text class="settings-item__label">主题</text>
        <view class="theme-list">
          <view
            v-for="(theme, name) in themes"
            :key="name"
            class="theme-item"
            :class="{ 'theme-item--active': settings.theme === name }"
            :style="{ background: theme.background, color: theme.color }"
            @tap="selectTheme(name)"
          >
            Aa
          </view>
        </view>
      </view>

      <!-- 页面边距 -->
      <view class="settings-item">
        <text class="settings-item__label">页面边距</text>
        <slider 
          :value="settings.margin"
          :min="0"
          :max="32"
          :step="4"
          @change="onMarginChange"
        />
      </view>

      <!-- 亮度调节 -->
      <view class="settings-item">
        <text class="settings-item__label">亮度</text>
        <slider 
          :value="settings.brightness"
          :min="0"
          :max="100"
          :step="1"
          @change="onBrightnessChange"
        />
      </view>

      <!-- 夜间模式 -->
      <view class="settings-item">
        <text class="settings-item__label">夜间模式</text>
        <switch 
          :checked="settings.isNightMode"
          @change="onNightModeChange"
        />
      </view>
    </view>

    <!-- 重置按钮 -->
    <view class="settings-panel__footer">
      <button class="reset-btn" @tap="resetSettings">重置设置</button>
    </view>
  </view>
</template>

<script>
import { inject, ref, onMounted } from 'vue';
import ReadingSettings from '../models/ReadingSettings';
import ReadingSettingsService from '../services/ReadingSettingsService';

export default {
  name: 'ReadingSettingsPanel',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'settings-change'],
  setup(props, { emit }) {
    const uni = inject('uni');
    const settingsService = new ReadingSettingsService(uni);
    const settings = ref(settingsService.getSettings());
    const themes = ReadingSettings.themes;

    // 字体大小调整
    const increaseFontSize = () => {
      if (settings.value.fontSize < 24) {
        settings.value.fontSize += 1;
        updateSettings();
      }
    };

    const decreaseFontSize = () => {
      if (settings.value.fontSize > 12) {
        settings.value.fontSize -= 1;
        updateSettings();
      }
    };

    // 行高调整
    const onLineHeightChange = (e) => {
      settings.value.lineHeight = e.detail.value / 10;
      updateSettings();
    };

    // 主题选择
    const selectTheme = (theme) => {
      settings.value.theme = theme;
      settings.value.isNightMode = theme === 'night';
      updateSettings();
    };

    // 边距调整
    const onMarginChange = (e) => {
      settings.value.margin = e.detail.value;
      updateSettings();
    };

    // 亮度调整
    const onBrightnessChange = (e) => {
      settings.value.brightness = e.detail.value;
      updateSettings();
    };

    // 夜间模式切换
    const onNightModeChange = (e) => {
      settings.value.isNightMode = e.detail.value;
      settings.value.theme = settings.value.isNightMode ? 'night' : 'default';
      updateSettings();
    };

    // 重置设置
    const resetSettings = () => {
      settings.value = settingsService.resetSettings();
      updateSettings();
    };

    // 更新设置
    const updateSettings = () => {
      settingsService.saveSettings(settings.value);
      emit('settings-change', settings.value);
    };

    // 关闭面板
    const close = () => {
      emit('close');
    };

    return {
      settings,
      themes,
      increaseFontSize,
      decreaseFontSize,
      onLineHeightChange,
      selectTheme,
      onMarginChange,
      onBrightnessChange,
      onNightModeChange,
      resetSettings,
      close
    };
  }
};
</script>

<style>
.settings-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.settings-panel--visible {
  transform: translateY(0);
}

.settings-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.settings-panel__title {
  font-size: 18px;
  font-weight: bold;
}

.settings-panel__close {
  font-size: 24px;
  padding: 10px;
}

.settings-item {
  margin-bottom: 20px;
}

.settings-item__label {
  font-size: 16px;
  margin-bottom: 10px;
  display: block;
}

.settings-item__control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 200px;
  margin: 0 auto;
}

.control-btn {
  font-size: 20px;
  padding: 5px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.font-size-value {
  font-size: 16px;
}

.theme-list {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}

.theme-item {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border: 2px solid transparent;
}

.theme-item--active {
  border-color: #007AFF;
}

.settings-panel__footer {
  margin-top: 20px;
  text-align: center;
}

.reset-btn {
  background: #f5f5f5;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
}
</style>
