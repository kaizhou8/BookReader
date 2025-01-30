<template>
  <view class="reader-container" :style="readerStyle" @click="handleScreenTap">
    <!-- 顶部工具栏 -->
    <view class="toolbar top-toolbar" v-if="showToolbars">
      <view class="flex-row space-between">
        <view class="flex-row">
          <button class="btn-icon" @click="goBack">
            <text class="iconfont icon-back">返回</text>
          </button>
          <text class="chapter-title">{{ currentChapter.title }}</text>
        </view>
        <view class="flex-row">
          <text class="reading-progress">{{ currentProgress }}%</text>
        </view>
      </view>
    </view>

    <!-- 阅读内容区域 -->
    <scroll-view 
      class="content-container" 
      scroll-y 
      :scroll-top="scrollTop"
      @scroll="handleScroll"
      :style="contentStyle"
    >
      <view class="chapter-content" :style="textStyle">
        <text :decode="true">{{ currentChapter.content }}</text>
      </view>
    </scroll-view>

    <!-- 底部工具栏 -->
    <view class="toolbar bottom-toolbar" v-if="showToolbars">
      <view class="flex-row space-between">
        <button class="btn-icon" @click="prevChapter">
          <text class="iconfont icon-prev">上一章</text>
        </button>
        <button class="btn-icon" @click="showChapterList">
          <text class="iconfont icon-list">目录</text>
        </button>
        <button class="btn-icon" @click="showBookmarks">
          <text class="iconfont icon-bookmark">书签</text>
        </button>
        <button class="btn-icon" @click="showSettings">
          <text class="iconfont icon-settings">设置</text>
        </button>
        <button class="btn-icon" @click="nextChapter">
          <text class="iconfont icon-next">下一章</text>
        </button>
      </view>
    </view>

    <!-- 阅读设置面板 -->
    <reading-settings-panel
      :visible="showSettingsPanel"
      @close="hideSettings"
      @settings-change="onSettingsChange"
    />

    <!-- 书签列表面板 -->
    <bookmark-list
      :visible="showBookmarkPanel"
      :bookId="bookId"
      @close="hideBookmarks"
      @select-bookmark="jumpToBookmark"
      @edit-bookmark="editBookmark"
      @delete-bookmark="deleteBookmark"
    />

    <!-- 目录面板 -->
    <uni-popup ref="chapterListPopup" type="left">
      <view class="chapter-list-panel">
        <view class="chapter-list-title">目录</view>
        <scroll-view scroll-y class="chapter-list">
          <view 
            v-for="(chapter, index) in chapters" 
            :key="index"
            class="chapter-item"
            :class="{ active: currentChapterIndex === index }"
            @click="jumpToChapter(index)"
          >
            <text>{{ chapter.title }}</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import ReadingSettingsPanel from '../../components/ReadingSettingsPanel.vue';
import BookmarkList from '../../components/BookmarkList.vue';
import ReadingProgressService from '../../services/ReadingProgressService';
import BookmarkService from '../../services/BookmarkService';
import ReadingSettingsService from '../../services/ReadingSettingsService';

export default {
  components: {
    ReadingSettingsPanel,
    BookmarkList
  },
  setup() {
    const uni = inject('uni');
    const bookId = ref('');
    const chapters = ref([]);
    const currentChapterIndex = ref(0);
    const currentChapter = ref({ title: '', content: '' });
    const scrollTop = ref(0);
    const showToolbars = ref(false);
    const showSettingsPanel = ref(false);
    const showBookmarkPanel = ref(false);
    const currentProgress = ref(0);
    const toolbarTimer = ref(null);

    // 服务实例
    const progressService = new ReadingProgressService(uni);
    const bookmarkService = new BookmarkService(uni);
    const settingsService = new ReadingSettingsService(uni);

    // 获取阅读设置
    const settings = ref(settingsService.getSettings());

    // 计算属性
    const readerStyle = computed(() => {
      const theme = settings.value.getCurrentThemeStyle();
      return {
        backgroundColor: theme.background,
        color: theme.color
      };
    });

    const contentStyle = computed(() => ({
      padding: `${settings.value.margin}rpx`,
      fontSize: `${settings.value.fontSize}px`,
      lineHeight: settings.value.lineHeight
    }));

    const textStyle = computed(() => ({
      textAlign: 'justify',
      fontFamily: settings.value.fontFamily
    }));

    // 加载书籍内容
    const loadBookContent = async () => {
      try {
        // 加载章节列表
        const chaptersRes = await uni.request({
          url: `your-api-endpoint/books/${bookId.value}/chapters`,
          method: 'GET'
        });
        chapters.value = chaptersRes.data;

        // 加载阅读进度
        const progress = await progressService.getProgress(bookId.value);
        if (progress) {
          currentChapterIndex.value = progress.chapterIndex || 0;
          scrollTop.value = progress.scrollTop || 0;
        }

        // 加载当前章节
        await loadChapter(currentChapterIndex.value);
      } catch (error) {
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    };

    // 加载指定章节
    const loadChapter = async (index) => {
      try {
        const chapterRes = await uni.request({
          url: `your-api-endpoint/books/${bookId.value}/chapters/${index}`,
          method: 'GET'
        });
        currentChapter.value = chapterRes.data;
        currentChapterIndex.value = index;
        scrollTop.value = 0;
        saveReadingProgress();
      } catch (error) {
        uni.showToast({
          title: '加载章节失败',
          icon: 'none'
        });
      }
    };

    // 保存阅读进度
    const saveReadingProgress = async () => {
      const progress = {
        bookId: bookId.value,
        chapterId: currentChapter.value.id,
        position: currentProgress.value / 100,
        timestamp: Date.now()
      };
      await progressService.saveProgress(progress);
    };

    // 处理设置变更
    const onSettingsChange = (newSettings) => {
      settings.value = newSettings;
    };

    // 跳转到书签位置
    const jumpToBookmark = async (bookmark) => {
      try {
        await loadChapter(bookmark.chapterId);
        scrollTop.value = bookmark.position * getCurrentChapterHeight();
        hideBookmarks();
      } catch (error) {
        uni.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    };

    // 编辑书签
    const editBookmark = async (bookmark) => {
      // 显示编辑弹窗
      uni.showModal({
        title: '编辑笔记',
        content: bookmark.note || '',
        editable: true,
        success: async (res) => {
          if (res.confirm) {
            bookmark.note = res.content;
            await bookmarkService.updateBookmark(bookmark);
          }
        }
      });
    };

    // 删除书签
    const deleteBookmark = async (bookmark) => {
      try {
        await bookmarkService.deleteBookmark(bookId.value, bookmark.id);
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
      } catch (error) {
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        });
      }
    };

    // 显示/隐藏面板
    const showSettings = () => {
      showSettingsPanel.value = true;
    };

    const hideSettings = () => {
      showSettingsPanel.value = false;
    };

    const showBookmarks = () => {
      showBookmarkPanel.value = true;
    };

    const hideBookmarks = () => {
      showBookmarkPanel.value = false;
    };

    // 其他方法保持不变...

    onMounted(() => {
      const options = getCurrentInstance().proxy.$mp.query;
      bookId.value = options.id;
      loadBookContent();
    });

    return {
      bookId,
      chapters,
      currentChapterIndex,
      currentChapter,
      scrollTop,
      showToolbars,
      showSettingsPanel,
      showBookmarkPanel,
      currentProgress,
      settings,
      readerStyle,
      contentStyle,
      textStyle,
      loadChapter,
      saveReadingProgress,
      onSettingsChange,
      jumpToBookmark,
      editBookmark,
      deleteBookmark,
      showSettings,
      hideSettings,
      showBookmarks,
      hideBookmarks,
      // ... 其他方法
    };
  }
};
</script>

<style>
.reader-container {
  height: 100vh;
  position: relative;
}

.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  padding: 20rpx;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 100;
}

.top-toolbar {
  top: 0;
}

.bottom-toolbar {
  bottom: 0;
}

.content-container {
  height: 100%;
  width: 100%;
}

.chapter-content {
  padding: 20rpx;
  padding-top: 100rpx;
  padding-bottom: 100rpx;
}

.settings-panel {
  background-color: #ffffff;
  padding: 30rpx;
  border-radius: 20rpx 20rpx 0 0;
}

.settings-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.setting-item {
  margin: 20rpx 0;
}

.font-size-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10rpx;
}

.theme-list {
  display: flex;
  justify-content: space-around;
  margin-top: 10rpx;
}

.theme-item {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 4rpx solid transparent;
}

.theme-item.active {
  border-color: #1296db;
}

.chapter-list-panel {
  background-color: #ffffff;
  height: 100vh;
  width: 600rpx;
}

.chapter-list-title {
  padding: 30rpx;
  font-size: 32rpx;
  font-weight: bold;
  border-bottom: 1rpx solid #f0f0f0;
}

.chapter-list {
  height: calc(100vh - 100rpx);
}

.chapter-item {
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.chapter-item.active {
  color: #1296db;
  background-color: #f8f8f8;
}

.reading-progress {
  font-size: 24rpx;
  color: #999999;
}
</style>
