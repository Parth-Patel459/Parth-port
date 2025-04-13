class NewsAnalytics extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.analyticsData = {
            views: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            readingTime: 0
        };
        this.userInteractions = new Set();
    }

    static get observedAttributes() {
        return ['article-id'];
    }

    connectedCallback() {
        this.render();
        this.initializeAnalytics();
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-top: 1rem;
                    padding: 1rem;
                    background: var(--surface-color);
                    border-radius: 0.5rem;
                }

                .analytics-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                }

                .analytics-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 1rem;
                    background: var(--background-color);
                    border-radius: 0.5rem;
                    transition: transform 0.2s;
                }

                .analytics-item:hover {
                    transform: translateY(-2px);
                }

                .analytics-icon {
                    font-size: 1.5rem;
                    color: var(--primary-color);
                    margin-bottom: 0.5rem;
                }

                .analytics-value {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .analytics-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .interaction-buttons {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                    justify-content: center;
                }

                .interaction-button {
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

                .interaction-button:hover {
                    background: var(--surface-color);
                }

                .interaction-button.active {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }

                .interaction-button i {
                    font-size: 1rem;
                }

                .reading-time {
                    margin-top: 1rem;
                    text-align: center;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                }

                @media (max-width: 768px) {
                    .analytics-container {
                        grid-template-columns: 1fr 1fr;
                    }

                    .interaction-buttons {
                        flex-wrap: wrap;
                    }
                }
            </style>

            <div class="analytics-container">
                <div class="analytics-item">
                    <i class="fas fa-eye analytics-icon"></i>
                    <span class="analytics-value">${this.analyticsData.views}</span>
                    <span class="analytics-label">Views</span>
                </div>
                <div class="analytics-item">
                    <i class="fas fa-heart analytics-icon"></i>
                    <span class="analytics-value">${this.analyticsData.likes}</span>
                    <span class="analytics-label">Likes</span>
                </div>
                <div class="analytics-item">
                    <i class="fas fa-share-alt analytics-icon"></i>
                    <span class="analytics-value">${this.analyticsData.shares}</span>
                    <span class="analytics-label">Shares</span>
                </div>
                <div class="analytics-item">
                    <i class="fas fa-comment analytics-icon"></i>
                    <span class="analytics-value">${this.analyticsData.comments}</span>
                    <span class="analytics-label">Comments</span>
                </div>
            </div>

            <div class="interaction-buttons">
                <button class="interaction-button" data-action="like">
                    <i class="fas fa-heart"></i>
                    <span>Like</span>
                </button>
                <button class="interaction-button" data-action="share">
                    <i class="fas fa-share-alt"></i>
                    <span>Share</span>
                </button>
                <button class="interaction-button" data-action="comment">
                    <i class="fas fa-comment"></i>
                    <span>Comment</span>
                </button>
                <button class="interaction-button" data-action="bookmark">
                    <i class="fas fa-bookmark"></i>
                    <span>Save</span>
                </button>
            </div>

            <div class="reading-time">
                <i class="fas fa-clock"></i>
                <span>Estimated reading time: ${this.analyticsData.readingTime} min</span>
            </div>
        `;
    }

    async initializeAnalytics() {
        const articleId = this.getAttribute('article-id');
        if (!articleId) return;

        try {
            const response = await fetch(`/api/analytics/${articleId}`);
            const data = await response.json();
            this.analyticsData = { ...this.analyticsData, ...data };
            this.render();
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    }

    addEventListeners() {
        const buttons = this.shadowRoot.querySelectorAll('.interaction-button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                this.handleInteraction(action);
            });
        });
    }

    async handleInteraction(action) {
        const articleId = this.getAttribute('article-id');
        if (!articleId) return;

        const button = this.shadowRoot.querySelector(`[data-action="${action}"]`);
        if (!button) return;

        // Toggle active state
        button.classList.toggle('active');

        // Update analytics data
        switch (action) {
            case 'like':
                this.analyticsData.likes += button.classList.contains('active') ? 1 : -1;
                break;
            case 'share':
                this.analyticsData.shares += 1;
                this.handleShare();
                break;
            case 'comment':
                this.handleComment();
                break;
            case 'bookmark':
                this.handleBookmark(button.classList.contains('active'));
                break;
        }

        // Update UI
        this.render();

        // Send analytics to server
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    articleId,
                    action,
                    value: button.classList.contains('active')
                })
            });
        } catch (error) {
            console.error('Error sending analytics:', error);
        }
    }

    handleShare() {
        const articleId = this.getAttribute('article-id');
        const shareData = {
            title: document.title,
            text: 'Check out this article!',
            url: `${window.location.origin}/article/${articleId}`
        };

        if (navigator.share) {
            navigator.share(shareData)
                .catch(error => console.error('Error sharing:', error));
        } else {
            // Fallback for browsers that don't support Web Share API
            const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
            window.open(shareUrl, '_blank');
        }
    }

    handleComment() {
        const articleId = this.getAttribute('article-id');
        const commentModal = document.createElement('news-comment-modal');
        commentModal.setAttribute('article-id', articleId);
        document.body.appendChild(commentModal);
    }

    async handleBookmark(isBookmarked) {
        const articleId = this.getAttribute('article-id');
        try {
            await fetch('/api/bookmarks', {
                method: isBookmarked ? 'POST' : 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ articleId })
            });
        } catch (error) {
            console.error('Error updating bookmark:', error);
        }
    }

    calculateReadingTime(content) {
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }
}

customElements.define('news-analytics', NewsAnalytics); 