import { 
    formatDate, 
    formatRelativeTime, 
    truncateText, 
    formatSource, 
    getCategoryColor, 
    getCategoryIcon,
    getReadingTime,
    formatArticleContent,
    isArticleSaved,
    isArticleRead
} from '../utils/helpers';

class NewsArticle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['title', 'description', 'url', 'image', 'source', 'published-at', 'view-mode'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const title = this.getAttribute('title') || '';
        const description = this.getAttribute('description') || '';
        const url = this.getAttribute('url') || '#';
        const image = this.getAttribute('image') || '';
        const source = this.getAttribute('source') || '';
        const publishedAt = this.getAttribute('published-at') || '';
        const viewMode = this.getAttribute('view-mode') || 'grid';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .article {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--surface-color);
                    border-radius: 0.5rem;
                    overflow: hidden;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .article:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                .article.grid {
                    flex-direction: column;
                }

                .article.list {
                    flex-direction: row;
                }

                .image-container {
                    position: relative;
                    padding-top: 56.25%; /* 16:9 aspect ratio */
                    overflow: hidden;
                }

                .article.list .image-container {
                    padding-top: 0;
                    width: 200px;
                    height: 100%;
                }

                .article-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .content {
                    padding: 1rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .article.list .content {
                    padding: 1.5rem;
                }

                .title {
                    margin: 0 0 0.5rem;
                    font-size: 1.1rem;
                    line-height: 1.4;
                    color: var(--text-primary);
                }

                .description {
                    margin: 0 0 1rem;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    color: var(--text-secondary);
                    flex: 1;
                }

                .meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }

                .source {
                    font-weight: 600;
                }

                .published-at {
                    opacity: 0.8;
                }

                @media (max-width: 768px) {
                    .article.list {
                        flex-direction: column;
                    }

                    .article.list .image-container {
                        width: 100%;
                        height: auto;
                        padding-top: 56.25%;
                    }
                }
            </style>

            <a href="${url}" class="article ${viewMode}" target="_blank" rel="noopener noreferrer">
                <div class="image-container">
                    <img 
                        class="article-image" 
                        src="${image}" 
                        alt="${title}"
                        loading="lazy"
                    >
                </div>
                <div class="content">
                    <h3 class="title">${title}</h3>
                    <p class="description">${description}</p>
                    <div class="meta">
                        <span class="source">${source}</span>
                        <span class="published-at">${this.formatDate(publishedAt)}</span>
                    </div>
                </div>
            </a>
        `;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }
}

customElements.define('news-article', NewsArticle); 