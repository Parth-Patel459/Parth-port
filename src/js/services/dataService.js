import databaseConfig from '../config/database.js';

class DataService {
    constructor() {
        this.config = databaseConfig;
        this.cachedArticles = new Map();
        this.lastFetchTime = 0;
    }

    // Fetch news articles
    async fetchNews(params = {}) {
        const { category = 'general', page = 1, pageSize = 20, query = '' } = params;
        const cacheKey = `${category}-${page}-${query}`;

        // Check cache first
        if (this.isCacheValid(cacheKey)) {
            return this.getFromCache(cacheKey);
        }

        try {
            const url = new URL(`${this.config.newsAPI.baseUrl}${this.config.newsAPI.endpoints.topHeadlines}`);
            url.searchParams.append('apiKey', this.config.newsAPI.apiKey);
            url.searchParams.append('category', category);
            url.searchParams.append('page', page);
            url.searchParams.append('pageSize', pageSize);
            
            if (query) {
                url.searchParams.append('q', query);
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch news');
            }

            const data = await response.json();
            this.cacheArticles(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching news:', error);
            throw error;
        }
    }

    // Fetch news sources
    async fetchSources() {
        try {
            const url = new URL(`${this.config.newsAPI.baseUrl}${this.config.newsAPI.endpoints.sources}`);
            url.searchParams.append('apiKey', this.config.newsAPI.apiKey);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch sources');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching sources:', error);
            throw error;
        }
    }

    // Save article to local storage
    saveArticle(article) {
        try {
            const savedArticles = this.getSavedArticles();
            if (!savedArticles.some(a => a.url === article.url)) {
                savedArticles.push(article);
                localStorage.setItem(
                    this.config.localStorage.savedArticles,
                    JSON.stringify(savedArticles)
                );
            }
        } catch (error) {
            console.error('Error saving article:', error);
        }
    }

    // Get saved articles from local storage
    getSavedArticles() {
        try {
            const saved = localStorage.getItem(this.config.localStorage.savedArticles);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error getting saved articles:', error);
            return [];
        }
    }

    // Mark article as read
    markArticleAsRead(articleUrl) {
        try {
            const readArticles = this.getReadArticles();
            if (!readArticles.includes(articleUrl)) {
                readArticles.push(articleUrl);
                localStorage.setItem(
                    this.config.localStorage.readArticles,
                    JSON.stringify(readArticles)
                );
            }
        } catch (error) {
            console.error('Error marking article as read:', error);
        }
    }

    // Get read articles
    getReadArticles() {
        try {
            const read = localStorage.getItem(this.config.localStorage.readArticles);
            return read ? JSON.parse(read) : [];
        } catch (error) {
            console.error('Error getting read articles:', error);
            return [];
        }
    }

    // Save user preferences
    saveUserPreferences(preferences) {
        try {
            localStorage.setItem(
                this.config.localStorage.userPreferences,
                JSON.stringify(preferences)
            );
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    // Get user preferences
    getUserPreferences() {
        try {
            const preferences = localStorage.getItem(this.config.localStorage.userPreferences);
            return preferences ? JSON.parse(preferences) : {
                categories: this.config.categories,
                sources: this.config.defaultSources,
                darkMode: false,
                language: 'en'
            };
        } catch (error) {
            console.error('Error getting preferences:', error);
            return {
                categories: this.config.categories,
                sources: this.config.defaultSources,
                darkMode: false,
                language: 'en'
            };
        }
    }

    // Cache management
    isCacheValid(cacheKey) {
        if (!this.config.cache.enabled) return false;
        
        const cachedData = this.cachedArticles.get(cacheKey);
        if (!cachedData) return false;

        const now = Date.now();
        return (now - cachedData.timestamp) < this.config.cache.duration;
    }

    getFromCache(cacheKey) {
        return this.cachedArticles.get(cacheKey)?.data;
    }

    cacheArticles(cacheKey, data) {
        if (this.config.cache.enabled) {
            this.cachedArticles.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            // Clean up old cache entries if needed
            if (this.cachedArticles.size > this.config.cache.maxArticles) {
                const oldestKey = Array.from(this.cachedArticles.keys())[0];
                this.cachedArticles.delete(oldestKey);
            }
        }
    }
}

export default new DataService(); 