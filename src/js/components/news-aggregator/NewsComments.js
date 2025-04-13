class NewsComments extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.comments = [];
        this.replyTo = null;
        this.sortBy = 'newest';
    }

    static get observedAttributes() {
        return ['article-id'];
    }

    connectedCallback() {
        this.render();
        this.loadComments();
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-top: 2rem;
                }

                .comments-container {
                    background: var(--surface-color);
                    border-radius: 0.5rem;
                    padding: 1.5rem;
                }

                .comments-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .comments-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                }

                .sort-options {
                    display: flex;
                    gap: 0.5rem;
                }

                .sort-button {
                    padding: 0.5rem 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    background: var(--background-color);
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .sort-button:hover {
                    background: var(--surface-color);
                }

                .sort-button.active {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }

                .comment-form {
                    margin-bottom: 2rem;
                }

                .comment-input {
                    width: 100%;
                    padding: 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    background: var(--background-color);
                    color: var(--text-primary);
                    font-size: 1rem;
                    resize: vertical;
                    min-height: 100px;
                    margin-bottom: 1rem;
                }

                .comment-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                .form-button {
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .form-button.submit {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                }

                .form-button.cancel {
                    background: var(--surface-color);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }

                .comments-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .comment {
                    background: var(--background-color);
                    border-radius: 0.5rem;
                    padding: 1rem;
                }

                .comment-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .comment-author {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .comment-date {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .comment-content {
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                }

                .comment-actions {
                    display: flex;
                    gap: 1rem;
                }

                .action-button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    border: none;
                    background: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-button:hover {
                    color: var(--primary-color);
                }

                .replies {
                    margin-left: 2rem;
                    margin-top: 1rem;
                    padding-left: 1rem;
                    border-left: 2px solid var(--border-color);
                }

                .reply-form {
                    margin-top: 1rem;
                    display: none;
                }

                .reply-form.show {
                    display: block;
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

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @media (max-width: 768px) {
                    .comments-container {
                        padding: 1rem;
                    }

                    .replies {
                        margin-left: 1rem;
                    }

                    .form-actions {
                        flex-direction: column;
                    }

                    .form-button {
                        width: 100%;
                    }
                }
            </style>

            <div class="comments-container">
                <div class="comments-header">
                    <h2 class="comments-title">Comments</h2>
                    <div class="sort-options">
                        <button class="sort-button ${this.sortBy === 'newest' ? 'active' : ''}" data-sort="newest">
                            Newest
                        </button>
                        <button class="sort-button ${this.sortBy === 'popular' ? 'active' : ''}" data-sort="popular">
                            Popular
                        </button>
                    </div>
                </div>

                <div class="comment-form">
                    <textarea 
                        class="comment-input" 
                        placeholder="Write a comment..."
                        rows="4"
                    ></textarea>
                    <div class="form-actions">
                        <button class="form-button cancel">Cancel</button>
                        <button class="form-button submit">Post Comment</button>
                    </div>
                </div>

                <div class="comments-list">
                    ${this.comments.map(comment => this.renderComment(comment)).join('')}
                </div>
            </div>
        `;
    }

    renderComment(comment) {
        return `
            <div class="comment" data-id="${comment.id}">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${this.formatDate(comment.date)}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
                <div class="comment-actions">
                    <button class="action-button" data-action="like">
                        <i class="fas fa-heart"></i>
                        <span>${comment.likes}</span>
                    </button>
                    <button class="action-button" data-action="reply">
                        <i class="fas fa-reply"></i>
                        <span>Reply</span>
                    </button>
                </div>
                ${comment.replies && comment.replies.length > 0 ? `
                    <div class="replies">
                        ${comment.replies.map(reply => this.renderComment(reply)).join('')}
                    </div>
                ` : ''}
                <div class="reply-form">
                    <textarea 
                        class="comment-input" 
                        placeholder="Write a reply..."
                        rows="3"
                    ></textarea>
                    <div class="form-actions">
                        <button class="form-button cancel">Cancel</button>
                        <button class="form-button submit">Post Reply</button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadComments() {
        const articleId = this.getAttribute('article-id');
        if (!articleId) return;

        try {
            const response = await fetch(`/api/comments/${articleId}?sort=${this.sortBy}`);
            const data = await response.json();
            this.comments = data;
            this.render();
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    addEventListeners() {
        // Sort buttons
        const sortButtons = this.shadowRoot.querySelectorAll('.sort-button');
        sortButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.sortBy = button.dataset.sort;
                this.loadComments();
            });
        });

        // Comment form
        const commentForm = this.shadowRoot.querySelector('.comment-form');
        const commentInput = commentForm.querySelector('.comment-input');
        const submitButton = commentForm.querySelector('.form-button.submit');
        const cancelButton = commentForm.querySelector('.form-button.cancel');

        submitButton.addEventListener('click', () => {
            this.submitComment(commentInput.value);
        });

        cancelButton.addEventListener('click', () => {
            commentInput.value = '';
        });

        // Reply forms
        const replyButtons = this.shadowRoot.querySelectorAll('.action-button[data-action="reply"]');
        replyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const comment = button.closest('.comment');
                const replyForm = comment.querySelector('.reply-form');
                replyForm.classList.toggle('show');
            });
        });

        // Like buttons
        const likeButtons = this.shadowRoot.querySelectorAll('.action-button[data-action="like"]');
        likeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const comment = button.closest('.comment');
                this.likeComment(comment.dataset.id);
            });
        });
    }

    async submitComment(content, parentId = null) {
        const articleId = this.getAttribute('article-id');
        if (!articleId || !content.trim()) return;

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    articleId,
                    content,
                    parentId
                })
            });

            if (response.ok) {
                this.loadComments();
                const commentInput = this.shadowRoot.querySelector('.comment-input');
                commentInput.value = '';
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    }

    async likeComment(commentId) {
        try {
            const response = await fetch(`/api/comments/${commentId}/like`, {
                method: 'POST'
            });

            if (response.ok) {
                this.loadComments();
            }
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
}

customElements.define('news-comments', NewsComments); 