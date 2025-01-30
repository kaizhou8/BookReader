<template>
  <view class="bookmark-list" :class="{ 'bookmark-list--visible': visible }">
    <view class="bookmark-list__header">
      <text class="bookmark-list__title">书签列表</text>
      <text class="bookmark-list__close" @tap="close">×</text>
    </view>
    
    <scroll-view class="bookmark-list__content" scroll-y>
      <view v-if="bookmarks.length === 0" class="bookmark-list__empty">
        暂无书签
      </view>
      <view 
        v-else
        v-for="bookmark in bookmarks" 
        :key="bookmark.id"
        class="bookmark-item"
        @tap="onBookmarkSelect(bookmark)"
      >
        <view class="bookmark-item__header">
          <text class="bookmark-item__time">{{ formatTime(bookmark.timestamp) }}</text>
          <text class="bookmark-item__progress">{{ Math.round(bookmark.position * 100) }}%</text>
        </view>
        <view class="bookmark-item__content">{{ bookmark.content }}</view>
        <view v-if="bookmark.note" class="bookmark-item__note">{{ bookmark.note }}</view>
        <view class="bookmark-item__actions">
          <text class="action-btn" @tap.stop="editBookmark(bookmark)">编辑</text>
          <text class="action-btn action-btn--delete" @tap.stop="deleteBookmark(bookmark)">删除</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { inject, ref, onMounted } from 'vue';
import BookmarkService from '../services/BookmarkService';

export default {
  name: 'BookmarkList',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    bookId: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'select-bookmark', 'edit-bookmark', 'delete-bookmark'],
  setup(props, { emit }) {
    const uni = inject('uni');
    const bookmarkService = new BookmarkService(uni);
    const bookmarks = ref([]);

    const loadBookmarks = async () => {
      try {
        const data = await bookmarkService.getBookmarks(props.bookId);
        bookmarks.value = data;
      } catch (error) {
        uni.showToast({
          title: '加载书签失败',
          icon: 'none'
        });
      }
    };

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}`;
    };

    const onBookmarkSelect = (bookmark) => {
      emit('select-bookmark', bookmark);
    };

    const editBookmark = (bookmark) => {
      emit('edit-bookmark', bookmark);
    };

    const deleteBookmark = async (bookmark) => {
      try {
        await uni.showModal({
          title: '删除书签',
          content: '确定要删除这个书签吗？',
          confirmText: '删除',
          confirmColor: '#ff4d4f'
        });
        
        await bookmarkService.deleteBookmark(props.bookId, bookmark.id);
        await loadBookmarks();
        
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
      } catch (error) {
        if (error.cancel) return;
        
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        });
      }
    };

    const close = () => {
      emit('close');
    };

    onMounted(() => {
      if (props.visible) {
        loadBookmarks();
      }
    });

    return {
      bookmarks,
      formatTime,
      onBookmarkSelect,
      editBookmark,
      deleteBookmark,
      close
    };
  }
};
</script>

<style>
.bookmark-list {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  height: 60vh;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.bookmark-list--visible {
  transform: translateY(0);
}

.bookmark-list__header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.bookmark-list__title {
  font-size: 18px;
  font-weight: bold;
}

.bookmark-list__close {
  font-size: 24px;
  padding: 10px;
}

.bookmark-list__content {
  height: calc(100% - 70px);
  padding: 10px;
}

.bookmark-list__empty {
  text-align: center;
  color: #999;
  padding: 20px;
}

.bookmark-item {
  margin-bottom: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 10px;
}

.bookmark-item__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.bookmark-item__content {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 10px;
}

.bookmark-item__note {
  font-size: 14px;
  color: #666;
  background: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
}

.bookmark-item__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.action-btn {
  font-size: 14px;
  color: #007AFF;
  padding: 5px 10px;
}

.action-btn--delete {
  color: #ff4d4f;
}
</style>
