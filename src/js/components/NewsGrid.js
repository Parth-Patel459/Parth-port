import dataService from '../services/dataService';
import { debounce } from '../utils/helpers';

class NewsGrid extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.articles = [];
        this.page = 1;
        this.isLoading = false;
        this.hasMore = true;
        this.viewMode = 'grid';
    }

    static get observedAttributes() {
        return ['view-mode'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'view-mode' && oldValue !== newValue) {
            this.viewMode = newValue;
            this.render();
        }
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
        this.loadArticles();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .grid-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                    padding: 1rem;
                }

                .grid-container.list {
                    grid-template-columns: 1fr;
                }

                .loading {
                    display: flex;
                    justify-content: center;
                    align-items: center;
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

                .load-more {
                    display: flex;
                    justify-content: center;
                    padding: 1rem;
                }

                .load-more-button {
                    padding: 0.75rem 1.5rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .load-more-button:hover {
                    background: var(--primary-color-dark);
                }

                .load-more-button:disabled {
                    background: var(--text-secondary);
                    cursor: not-allowed;
                }

                .no-articles {
                    text-align: center;
                    padding: 2rem;
                    color: var(--text-secondary);
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @media (max-width: 768px) {
                    .grid-container {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                        padding: 0.5rem;
                    }
                }
            </style>

            <div class="grid-container ${this.viewMode}">
                ${this.articles.map(article => `
                    <news-article
                        title="${this.escapeHtml(article.title)}"
                        description="${this.escapeHtml(article.description)}"
                        url="${this.escapeHtml(article.url)}"
                        image="${this.escapeHtml(article.urlToImage)}"
                        source="${this.escapeHtml(article.source.name)}"
                        published-at="${this.escapeHtml(article.publishedAt)}"
                        view-mode="${this.viewMode}"
                    ></news-article>
                `).join('')}
            </div>

            ${this.isLoading ? `
                <div class="loading">
                    <div class="loading-spinner"></div>
                </div>
            ` : ''}

            ${!this.isLoading && this.hasMore ? `
                <div class="load-more">
                    <button class="load-more-button" ${this.isLoading ? 'disabled' : ''}>
                        Load More Articles
                    </button>
                </div>
            ` : ''}

            ${!this.isLoading && this.articles.length === 0 ? `
                <div class="no-articles">
                    No articles found. Try adjusting your search or filters.
                </div>
            ` : ''}
        `;
    }

    addEventListeners() {
        const loadMoreButton = this.shadowRoot.querySelector('.load-more-button');
        if (loadMoreButton) {
            loadMoreButton.addEventListener('click', () => this.loadMoreArticles());
        }

        // Intersection Observer for infinite scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading && this.hasMore) {
                    this.loadMoreArticles();
                }
            });
        });

        const sentinel = document.createElement('div');
        sentinel.style.height = '1px';
        this.shadowRoot.appendChild(sentinel);
        observer.observe(sentinel);
    }

    async loadArticles() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.render();

        try {
            const response = await fetch(`/api/news?page=${this.page}`);
            const data = await response.json();

            if (data.articles && data.articles.length > 0) {
                this.articles = [...this.articles, ...data.articles];
                this.hasMore = data.articles.length === 20; // Assuming 20 articles per page
            } else {
                this.hasMore = false;
            }
        } catch (error) {
            console.error('Error loading articles:', error);
            this.hasMore = false;
        } finally {
            this.isLoading = false;
            this.render();
        }
    }

    loadMoreArticles() {
        this.page++;
        this.loadArticles();
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

customElements.define('news-grid', NewsGrid); 