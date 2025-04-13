class NewsRecommendations extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.recommendations = [];
        this.isLoading = false;
    }

    static get observedAttributes() {
        return ['article-id'];
    }

    connectedCallback() {
        this.render();
        this.loadRecommendations();
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-top: 2rem;
                }

                .recommendations-container {
                    background: var(--surface-color);
                    border-radius: 0.5rem;
                    padding: 1.5rem;
                }

                .recommendations-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .recommendations-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                }

                .refresh-button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    background: var(--background-color);
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .refresh-button:hover {
                    background: var(--surface-color);
                }

                .refresh-button i {
                    transition: transform 0.3s;
                }

                .refresh-button.refreshing i {
                    animation: spin 1s linear infinite;
                }

                .recommendations-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .recommendation-card {
                    background: var(--background-color);
                    border-radius: 0.5rem;
                    overflow: hidden;
                    transition: transform 0.2s;
                    cursor: pointer;
                }

                .recommendation-card:hover {
                    transform: translateY(-2px);
                }

                .recommendation-image {
                    width: 100%;
                    height: 150px;
                    object-fit: cover;
                }

                .recommendation-content {
                    padding: 1rem;
                }

                .recommendation-title {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .recommendation-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .recommendation-source {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .source-icon {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .recommendation-date {
                    white-space: nowrap;
                }

                .loading {
                    display: flex;
                    justify-content: center;
                    padding: 2rem;
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid var(--surface-color);
                    border-top-color: var(--primary-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .error-message {
                    text-align: center;
                    padding: 2rem;
                    color: var(--error-color);
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @media (max-width: 768px) {
                    .recommendations-container {
                        padding: 1rem;
                    }

                    .recommendations-grid {
                        grid-template-columns: 1fr;
                    }

                    .recommendation-image {
                        height: 200px;
                    }
                }
            </style>

            <div class="recommendations-container">
                <div class="recommendations-header">
                    <h2 class="recommendations-title">Recommended Articles</h2>
                    <button class="refresh-button">
                        <i class="fas fa-sync-alt"></i>
                        <span>Refresh</span>
                    </button>
                </div>

                ${this.isLoading ? `
                    <div class="loading">
                        <div class="loading-spinner"></div>
                    </div>
                ` : this.recommendations.length > 0 ? `
                    <div class="recommendations-grid">
                        ${this.recommendations.map(article => this.renderRecommendation(article)).join('')}
                    </div>
                ` : `
                    <div class="error-message">
                        No recommendations available at the moment.
                    </div>
                `}
            </div>
        `;
    }

    renderRecommendation(article) {
        return `
            <div class="recommendation-card" data-id="${article.id}">
                <img 
                    class="recommendation-image" 
                    src="${article.imageUrl || '/images/placeholder.jpg'}" 
                    alt="${article.title}"
                    loading="lazy"
                >
                <div class="recommendation-content">
                    <h3 class="recommendation-title">${article.title}</h3>
                    <div class="recommendation-meta">
                        <div class="recommendation-source">
                            <img 
                                class="source-icon" 
                                src="${article.sourceIcon || '/images/source-placeholder.png'}" 
                                alt="${article.source}"
                            >
                            <span>${article.source}</span>
                        </div>
                        <span class="recommendation-date">${this.formatDate(article.publishedAt)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    async loadRecommendations() {
        const articleId = this.getAttribute('article-id');
        if (!articleId) return;

        this.isLoading = true;
        this.render();

        try {
            const response = await fetch(`/api/recommendations/${articleId}`);
            const data = await response.json();
            this.recommendations = data;
        } catch (error) {
            console.error('Error loading recommendations:', error);
            this.recommendations = [];
        } finally {
            this.isLoading = false;
            this.render();
        }
    }

    addEventListeners() {
        // Refresh button
        const refreshButton = this.shadowRoot.querySelector('.refresh-button');
        refreshButton.addEventListener('click', () => {
            refreshButton.classList.add('refreshing');
            this.loadRecommendations().finally(() => {
                refreshButton.classList.remove('refreshing');
            });
        });

        // Recommendation cards
        const cards = this.shadowRoot.querySelectorAll('.recommendation-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const articleId = card.dataset.id;
                this.navigateToArticle(articleId);
            });
        });
    }

    navigateToArticle(articleId) {
        window.location.href = `/article/${articleId}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric'
        }).format(date);
    }
}

customElements.define('news-recommendations', NewsRecommendations); 