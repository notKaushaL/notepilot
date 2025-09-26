// Utility functions for text processing and AI features

export const getWordCount = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const getCharCount = (text) => {
  if (!text) return 0;
  return text.length;
};

export const getReadingTime = (text) => {
  const words = getWordCount(text);
  const wordsPerMinute = 200; // Average reading speed
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

export const cleanText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove HTML entities
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const extractKeywords = (text, limit = 10) => {
  if (!text) return [];
  
  const cleanedText = cleanText(text).toLowerCase();
  const words = cleanedText.split(/\s+/);
  
  // Filter out common words and short words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
  ]);
  
  const keywords = words
    .filter(word => word.length > 3 && !stopWords.has(word))
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
  
  return Object.entries(keywords)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([word]) => word);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};