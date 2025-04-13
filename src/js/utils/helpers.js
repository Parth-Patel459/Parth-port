import { format, formatDistanceToNow } from 'date-fns';

// Format date to readable string
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
};

// Truncate text to specified length
export const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Generate unique ID
export const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Debounce function
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

// Throttle function
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Format article source
export const formatSource = (source) => {
    return source?.name?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Source';
};

// Sanitize HTML content
export const sanitizeHTML = (html) => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
};

// Check if device is mobile
export const isMobile = () => {
    return window.innerWidth <= 768;
};

// Check if device supports touch
export const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Get image dimensions
export const getImageDimensions = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({
                width: img.width,
                height: img.height
            });
        };
        img.onerror = reject;
        img.src = url;
    });
};

// Format number with commas
export const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Check if article is saved
export const isArticleSaved = (articleUrl) => {
    const savedArticles = JSON.parse(localStorage.getItem('news_aggregator_saved_articles') || '[]');
    return savedArticles.some(article => article.url === articleUrl);
};

// Check if article is read
export const isArticleRead = (articleUrl) => {
    const readArticles = JSON.parse(localStorage.getItem('news_aggregator_read_articles') || '[]');
    return readArticles.includes(articleUrl);
};

// Get reading time in minutes
export const getReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

// Format article content for display
export const formatArticleContent = (content) => {
    if (!content) return '';
    
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    
    // Remove extra whitespace
    return text.replace(/\s+/g, ' ').trim();
};

// Get category color
export const getCategoryColor = (category) => {
    const colors = {
        general: '#2563eb',
        business: '#059669',
        entertainment: '#7c3aed',
        health: '#dc2626',
        science: '#0891b2',
        sports: '#d97706',
        technology: '#4f46e5'
    };
    
    return colors[category] || '#6b7280';
};

// Get category icon
export const getCategoryIcon = (category) => {
    const icons = {
        general: 'newspaper',
        business: 'chart-line',
        entertainment: 'film',
        health: 'heartbeat',
        science: 'flask',
        sports: 'running',
        technology: 'microchip'
    };
    
    return icons[category] || 'newspaper';
}; 