// News Aggregator JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const newsGrid = document.getElementById('news-grid');
    const searchInput = document.querySelector('.search-bar input');
    const loadMoreBtn = document.querySelector('.load-more-btn');
    const backToTopBtn = document.getElementById('back-to-top');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const searchResultsCount = document.querySelector('.search-results-count');

    // State
    let currentPage = 1;
    let isLoading = false;
    let searchTimeout = null;
    let allNewsItems = [];
    let currentCategory = 'general';

    // Initialize
    fetchNews();
    setupEventListeners();

    // Event Listeners
    function setupEventListeners() {
        // Search functionality
        searchInput.addEventListener('input', handleSearch);
        
        // Load more articles
        loadMoreBtn.addEventListener('click', loadMoreArticles);
        
        // Back to top button
        window.addEventListener('scroll', handleScroll);
        backToTopBtn.addEventListener('click', scrollToTop);
        
        // Category navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const category = item.textContent.trim().toLowerCase();
                currentCategory = category;
                currentPage = 1;
                allNewsItems = [];
                newsGrid.innerHTML = '';
                fetchNews();
                
                // Update active state
                document.querySelectorAll('.nav-item').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                item.classList.add('active');
            });
        });

        // Mobile sidebar toggle
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.querySelector('.main-header').prepend(mobileMenuBtn);
        
        mobileMenuBtn.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }

    // Fetch News
    async function fetchNews() {
        try {
            isLoading = true;
            loadMoreBtn.classList.add('loading');
            
            // Replace with your NewsAPI key
            const API_KEY = 'YOUR_NEWS_API_KEY';
            const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&category=${currentCategory}&apiKey=${API_KEY}&page=${currentPage}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.articles && data.articles.length > 0) {
                allNewsItems = [...allNewsItems, ...data.articles];
                renderNewsItems(data.articles);
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
                if (currentPage === 1) {
                    showError('No articles found. Please try a different category or search term.');
                }
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            showError('Failed to load news articles. Please try again later.');
        } finally {
            isLoading = false;
            loadMoreBtn.classList.remove('loading');
        }
    }

    // Render News Items
    function renderNewsItems(articles) {
        articles.forEach(article => {
            const newsItem = createNewsItem(article);
            newsGrid.appendChild(newsItem);
        });
    }

    // Create News Item
    function createNewsItem(article) {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        
        // Format date
        const date = new Date(article.publishedAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Create news item HTML
        newsItem.innerHTML = `
            <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="news-link">
                <div class="news-image-container">
                    <img src="${article.urlToImage || '../assets/images/placeholder.jpg'}" 
                         alt="${article.title}" 
                         class="news-image"
                         onerror="this.src='../assets/images/placeholder.jpg'">
                </div>
                <div class="news-content">
                    <h2 class="news-title">${article.title}</h2>
                    <p class="news-description">${article.description || 'No description available'}</p>
                    <div class="news-meta">
                        <span class="news-source">${article.source.name}</span>
                        <span class="news-date">${formattedDate}</span>
                    </div>
                </div>
            </a>
        `;
        
        return newsItem;
    }

    // Search Handler
    function handleSearch(e) {
        clearTimeout(searchTimeout);
        const searchTerm = e.target.value.toLowerCase().trim();
        
        searchTimeout = setTimeout(() => {
            if (searchTerm === '') {
                newsGrid.innerHTML = '';
                renderNewsItems(allNewsItems);
                searchResultsCount.textContent = '';
                return;
            }
            
            const filteredItems = allNewsItems.filter(article => 
                article.title.toLowerCase().includes(searchTerm) ||
                (article.description && article.description.toLowerCase().includes(searchTerm)) ||
                article.source.name.toLowerCase().includes(searchTerm)
            );
            
            updateSearchResults(filteredItems);
        }, 300);
    }

    // Update Search Results
    function updateSearchResults(filteredItems) {
        newsGrid.innerHTML = '';
        renderNewsItems(filteredItems);
        
        // Update search results count
        searchResultsCount.textContent = filteredItems.length > 0 
            ? `${filteredItems.length} results found` 
            : 'No results found';
    }

    // Load More Articles
    function loadMoreArticles() {
        if (!isLoading) {
            currentPage++;
            fetchNews();
        }
    }

    // Scroll Handler
    function handleScroll() {
        // Show/hide back to top button
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
        
        // Update scroll indicator
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        scrollIndicator.style.width = `${scrollPercentage}%`;
    }

    // Scroll to Top
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Show Error Message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        newsGrid.prepend(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Theme Toggle
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    document.querySelector('.header-right').appendChild(themeToggle);
    
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        
        // Save theme preference
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}); 