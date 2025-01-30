<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-box flex-row">
        <text class="iconfont icon-search"></text>
        <input 
          type="text" 
          v-model="searchKeyword"
          placeholder="搜索书名或作者"
          @confirm="handleSearch"
        />
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view 
      scroll-y 
      class="content-container"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="refresh"
    >
      <!-- 搜索结果 -->
      <block v-if="isSearchMode">
        <view class="search-result">
          <view class="result-header">
            <text>找到 {{ totalResults }} 本相关书籍</text>
          </view>
          <view class="book-list">
            <view 
              v-for="book in searchResults" 
              :key="book.id"
              class="book-item"
              @click="navigateToDetail(book)"
            >
              <image class="book-cover" :src="book.coverUrl" mode="aspectFill"></image>
              <view class="book-info">
                <text class="book-title">{{ book.title }}</text>
                <text class="book-author">{{ book.author }}</text>
                <text class="book-desc">{{ book.description }}</text>
                <view class="book-meta flex-row">
                  <text class="book-category">{{ book.category }}</text>
                  <text class="book-wordcount">{{ formatWordCount(book.wordCount) }}字</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </block>

      <!-- 推荐内容 -->
      <block v-else>
        <!-- 轮播图 -->
        <swiper class="banner" circular autoplay interval="3000">
          <swiper-item v-for="banner in banners" :key="banner.id">
            <image :src="banner.imageUrl" mode="aspectFill" @click="handleBannerClick(banner)"></image>
          </swiper-item>
        </swiper>

        <!-- 分类导航 -->
        <view class="category-nav">
          <view 
            v-for="category in categories" 
            :key="category.id"
            class="category-item"
            @click="navigateToCategory(category)"
          >
            <image :src="category.iconUrl"></image>
            <text>{{ category.name }}</text>
          </view>
        </view>

        <!-- 推荐板块 -->
        <view v-for="section in recommendSections" :key="section.id" class="recommend-section">
          <view class="section-header flex-row space-between">
            <text class="section-title">{{ section.title }}</text>
            <text class="more-link" @click="navigateToMore(section)">更多 ></text>
          </view>
          <scroll-view scroll-x class="book-scroll">
            <view class="book-scroll-content">
              <view 
                v-for="book in section.books" 
                :key="book.id"
                class="scroll-book-item"
                @click="navigateToDetail(book)"
              >
                <image class="book-cover" :src="book.coverUrl" mode="aspectFill"></image>
                <text class="book-title">{{ book.title }}</text>
                <text class="book-author">{{ book.author }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 排行榜 -->
        <view class="ranking-section">
          <view class="section-header">
            <text class="section-title">热门排行</text>
          </view>
          <view class="ranking-list">
            <view 
              v-for="(book, index) in rankingList" 
              :key="book.id"
              class="ranking-item"
              @click="navigateToDetail(book)"
            >
              <text class="ranking-number" :class="{ 'top3': index < 3 }">{{ index + 1 }}</text>
              <image class="book-cover" :src="book.coverUrl" mode="aspectFill"></image>
              <view class="book-info">
                <text class="book-title">{{ book.title }}</text>
                <text class="book-author">{{ book.author }}</text>
                <text class="book-popularity">{{ formatPopularity(book.popularity) }}人在读</text>
              </view>
            </view>
          </view>
        </view>
      </block>

      <!-- 加载更多 -->
      <view class="loading" v-if="isLoading">
        <text class="loading-text">加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 搜索相关
      searchKeyword: '',
      isSearchMode: false,
      searchResults: [],
      totalResults: 0,
      currentPage: 1,
      pageSize: 20,

      // 推荐内容
      banners: [],
      categories: [],
      recommendSections: [],
      rankingList: [],

      // 状态控制
      isLoading: false,
      isRefreshing: false,
    }
  },
  onLoad() {
    this.loadInitialData();
  },
  methods: {
    // 加载初始数据
    async loadInitialData() {
      try {
        await Promise.all([
          this.loadBanners(),
          this.loadCategories(),
          this.loadRecommendSections(),
          this.loadRankingList()
        ]);
      } catch (error) {
        console.error('加载数据失败:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    },

    // 加载轮播图
    async loadBanners() {
      const res = await uni.request({
        url: 'your-api-endpoint/banners',
        method: 'GET'
      });
      this.banners = res.data;
    },

    // 加载分类
    async loadCategories() {
      const res = await uni.request({
        url: 'your-api-endpoint/categories',
        method: 'GET'
      });
      this.categories = res.data;
    },

    // 加载推荐板块
    async loadRecommendSections() {
      const res = await uni.request({
        url: 'your-api-endpoint/recommend-sections',
        method: 'GET'
      });
      this.recommendSections = res.data;
    },

    // 加载排行榜
    async loadRankingList() {
      const res = await uni.request({
        url: 'your-api-endpoint/ranking',
        method: 'GET'
      });
      this.rankingList = res.data;
    },

    // 处理搜索
    async handleSearch() {
      if (!this.searchKeyword.trim()) return;

      this.isSearchMode = true;
      this.currentPage = 1;
      await this.searchBooks();
    },

    // 搜索书籍
    async searchBooks() {
      try {
        this.isLoading = true;
        const res = await uni.request({
          url: 'your-api-endpoint/search',
          method: 'GET',
          data: {
            keyword: this.searchKeyword,
            page: this.currentPage,
            pageSize: this.pageSize
          }
        });
        
        if (this.currentPage === 1) {
          this.searchResults = res.data.books;
        } else {
          this.searchResults = [...this.searchResults, ...res.data.books];
        }
        
        this.totalResults = res.data.total;
      } catch (error) {
        console.error('搜索失败:', error);
        uni.showToast({
          title: '搜索失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },

    // 加载更多
    async loadMore() {
      if (this.isLoading) return;
      if (this.isSearchMode && this.searchResults.length >= this.totalResults) return;

      this.currentPage++;
      if (this.isSearchMode) {
        await this.searchBooks();
      }
    },

    // 刷新
    async refresh() {
      this.isRefreshing = true;
      if (this.isSearchMode) {
        this.currentPage = 1;
        await this.searchBooks();
      } else {
        await this.loadInitialData();
      }
      this.isRefreshing = false;
    },

    // 导航到书籍详情
    navigateToDetail(book) {
      uni.navigateTo({
        url: `/pages/book/detail?id=${book.id}`
      });
    },

    // 导航到分类页面
    navigateToCategory(category) {
      uni.navigateTo({
        url: `/pages/category/list?id=${category.id}&name=${category.name}`
      });
    },

    // 导航到更多页面
    navigateToMore(section) {
      uni.navigateTo({
        url: `/pages/more/list?id=${section.id}&title=${section.title}`
      });
    },

    // 处理轮播图点击
    handleBannerClick(banner) {
      if (banner.type === 'book') {
        this.navigateToDetail({ id: banner.bookId });
      } else if (banner.type === 'url') {
        // 处理外部链接
        uni.navigateTo({
          url: `/pages/webview/webview?url=${encodeURIComponent(banner.url)}`
        });
      }
    },

    // 格式化字数
    formatWordCount(count) {
      if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
      }
      return count;
    },

    // 格式化人气数
    formatPopularity(count) {
      if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
      }
      return count;
    }
  }
}
</script>

<style>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.search-bar {
  padding: 20rpx;
  background-color: #ffffff;
}

.search-box {
  background-color: #f5f5f5;
  border-radius: 32rpx;
  padding: 10rpx 20rpx;
  align-items: center;
}

.search-box input {
  flex: 1;
  margin-left: 10rpx;
  font-size: 28rpx;
}

.content-container {
  flex: 1;
}

/* 轮播图样式 */
.banner {
  height: 300rpx;
}

.banner image {
  width: 100%;
  height: 100%;
}

/* 分类导航样式 */
.category-nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: 20rpx;
  background-color: #ffffff;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.category-item image {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 10rpx;
}

.category-item text {
  font-size: 24rpx;
}

/* 推荐板块样式 */
.recommend-section {
  margin-top: 20rpx;
  background-color: #ffffff;
  padding: 20rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
}

.more-link {
  font-size: 24rpx;
  color: #999999;
}

.book-scroll {
  white-space: nowrap;
}

.book-scroll-content {
  display: inline-flex;
}

.scroll-book-item {
  display: inline-flex;
  flex-direction: column;
  margin-right: 20rpx;
  width: 200rpx;
}

.scroll-book-item:last-child {
  margin-right: 0;
}

/* 排行榜样式 */
.ranking-section {
  margin-top: 20rpx;
  background-color: #ffffff;
  padding: 20rpx;
}

.ranking-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.ranking-number {
  width: 60rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #999999;
}

.ranking-number.top3 {
  color: #ff6b6b;
}

/* 书籍列表样式 */
.book-item {
  display: flex;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.book-cover {
  width: 160rpx;
  height: 200rpx;
  border-radius: 8rpx;
}

.book-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.book-author {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 10rpx;
}

.book-desc {
  font-size: 24rpx;
  color: #999999;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.book-meta {
  font-size: 24rpx;
  color: #999999;
}

.book-category {
  margin-right: 20rpx;
}

/* 加载样式 */
.loading {
  text-align: center;
  padding: 20rpx;
}

.loading-text {
  font-size: 24rpx;
  color: #999999;
}
</style>
