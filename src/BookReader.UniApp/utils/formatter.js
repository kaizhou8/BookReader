/**
 * 格式化日期
 * @param {number|Date} date - 时间戳或日期对象
 * @param {boolean} [showTime=true] - 是否显示时间
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, showTime = true) {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  if (!showTime) {
    return `${year}-${month}-${day}`;
  }
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
}

/**
 * 格式化阅读时间
 * @param {number} minutes - 分钟数
 * @returns {string} 格式化后的阅读时间
 */
export function formatReadingTime(minutes) {
  if (!minutes || minutes === 0) return '0分钟';
  
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}小时`;
  }
  
  return `${hours}小时${remainingMinutes}分钟`;
}

/**
 * 格式化相对时间
 * @param {number|Date} date - 时间戳或日期对象
 * @returns {string} 格式化后的相对时间
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const target = new Date(date);
  const diff = now - target;
  
  // 转换为分钟
  const minutes = Math.floor(diff / 1000 / 60);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}个月前`;
  
  const years = Math.floor(months / 12);
  return `${years}年前`;
}
