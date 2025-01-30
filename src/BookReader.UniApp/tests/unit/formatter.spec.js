import {
  formatDate,
  formatFileSize,
  formatReadingTime,
  formatRelativeTime
} from '../../utils/formatter';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Formatter Utils', () => {
  describe('formatDate', () => {
    it('格式化日期和时间', () => {
      const date = new Date('2025-01-30 14:30:00');
      expect(formatDate(date)).toBe('2025-01-30 14:30');
    });

    it('仅格式化日期', () => {
      const date = new Date('2025-01-30 14:30:00');
      expect(formatDate(date, false)).toBe('2025-01-30');
    });

    it('处理空值', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('formatFileSize', () => {
    it('格式化字节大小', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('处理小数', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });

    it('处理空值', () => {
      expect(formatFileSize(null)).toBe('0 B');
      expect(formatFileSize(undefined)).toBe('0 B');
    });
  });

  describe('formatReadingTime', () => {
    it('格式化阅读时间（分钟）', () => {
      expect(formatReadingTime(30)).toBe('30分钟');
      expect(formatReadingTime(0)).toBe('0分钟');
    });

    it('格式化阅读时间（小时）', () => {
      expect(formatReadingTime(60)).toBe('1小时');
      expect(formatReadingTime(90)).toBe('1小时30分钟');
    });

    it('处理空值', () => {
      expect(formatReadingTime(null)).toBe('0分钟');
      expect(formatReadingTime(undefined)).toBe('0分钟');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-30 14:30:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('格式化相对时间', () => {
      const now = new Date();
      
      // 刚刚
      expect(formatRelativeTime(now)).toBe('刚刚');
      
      // 分钟前
      const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5分钟前');
      
      // 小时前
      const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toBe('2小时前');
      
      // 天前
      const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeDaysAgo)).toBe('3天前');
      
      // 月前
      const twoMonthsAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoMonthsAgo)).toBe('2个月前');
      
      // 年前
      const oneYearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(oneYearAgo)).toBe('1年前');
    });

    it('处理空值', () => {
      expect(formatRelativeTime(null)).toBe('');
      expect(formatRelativeTime(undefined)).toBe('');
    });
  });
});
