// Database Configuration
const databaseConfig = {
    // NewsAPI Configuration
    newsAPI: {
        baseUrl: 'https://newsapi.org/v2',
        apiKey: 'YOUR_NEWS_API_KEY', // Replace with your actual NewsAPI key
        endpoints: {
            topHeadlines: '/top-headlines',
            everything: '/everything',
            sources: '/sources'
        }
    },

    // Local Storage Configuration
    localStorage: {
        userPreferences: 'news_aggregator_preferences',
        savedArticles: 'news_aggregator_saved_articles',
        readArticles: 'news_aggregator_read_articles'
    },

    // Categories and Sources
    categories: [
        'general',
        'business',
        'entertainment',
        'health',
        'science',
        'sports',
        'technology'
    ],

    // Default Sources
    defaultSources: [
        'bbc-news',
        'cnn',
        'the-verge',
        'techcrunch',
        'wired',
        'reuters',
        'associated-press'
    ],

    // Cache Configuration
    cache: {
        enabled: true,
        duration: 3600000, // 1 hour in milliseconds
        maxArticles: 100
    }
};

export default databaseConfig; 