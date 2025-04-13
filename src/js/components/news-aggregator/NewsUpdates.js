class NewsUpdates extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.socket = null;
        this.notifications = [];
        this.maxNotifications = 5;
        this.notificationTimeout = 5000;
    }

    connectedCallback() {
        this.render();
        this.initializeWebSocket();
        this.addEventListeners();
    }

    disconnectedCallback() {
        if (this.socket) {
            this.socket.close();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 1rem;
                    right: 1rem;
                    z-index: 1000;
                }

                .notifications-container {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    max-width: 350px;
                }

                .notification {
                    background: var(--background-color);
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    padding: 1rem;
                    box-shadow: var(--shadow-md);
                    transform: translateX(100%);
                    opacity: 0;
                    transition: all 0.3s ease-out;
                }

                .notification.show {
                    transform: translateX(0);
                    opacity: 1;
                }

                .notification.hide {
                    transform: translateX(100%);
                    opacity: 0;
                }

                .notification-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .notification-title {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                }

                .notification-close {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 0.25rem;
                    font-size: 1rem;
                }

                .notification-content {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    margin: 0;
                }

                .notification-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }

                .notification-button {
                    padding: 0.25rem 0.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.25rem;
                    background: var(--surface-color);
                    color: var(--text-primary);
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .notification-button:hover {
                    background: var(--primary-color-light);
                }

                .notification-button.primary {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }

                .notification-button.primary:hover {
                    background: var(--primary-color-dark);
                }

                .notification-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: var(--primary-color);
                    width: 100%;
                    transform-origin: left;
                    transform: scaleX(0);
                }

                .notification-progress.animate {
                    animation: progress ${this.notificationTimeout}ms linear forwards;
                }

                @keyframes progress {
                    to {
                        transform: scaleX(1);
                    }
                }

                @media (max-width: 768px) {
                    :host {
                        top: auto;
                        bottom: 1rem;
                        right: 1rem;
                        left: 1rem;
                    }

                    .notifications-container {
                        max-width: none;
                    }
                }
            </style>

            <div class="notifications-container"></div>
        `;
    }

    initializeWebSocket() {
        this.socket = new WebSocket('wss://your-websocket-server.com/news');

        this.socket.onopen = () => {
            console.log('WebSocket connection established');
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleNewsUpdate(data);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.socket.onclose = () => {
            console.log('WebSocket connection closed');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.initializeWebSocket(), 5000);
        };
    }

    handleNewsUpdate(data) {
        const notification = {
            id: Date.now(),
            title: data.title,
            content: data.content,
            type: data.type || 'info',
            actions: data.actions || []
        };

        this.notifications.unshift(notification);
        if (this.notifications.length > this.maxNotifications) {
            this.notifications.pop();
        }

        this.showNotification(notification);
    }

    showNotification(notification) {
        const container = this.shadowRoot.querySelector('.notifications-container');
        const notificationElement = document.createElement('div');
        notificationElement.className = 'notification';
        notificationElement.dataset.id = notification.id;

        notificationElement.innerHTML = `
            <div class="notification-header">
                <h3 class="notification-title">${notification.title}</h3>
                <button class="notification-close">&times;</button>
            </div>
            <p class="notification-content">${notification.content}</p>
            ${notification.actions.length > 0 ? `
                <div class="notification-footer">
                    ${notification.actions.map(action => `
                        <button 
                            class="notification-button ${action.primary ? 'primary' : ''}"
                            data-action="${action.type}"
                        >
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
            <div class="notification-progress"></div>
        `;

        container.appendChild(notificationElement);

        // Trigger animation
        requestAnimationFrame(() => {
            notificationElement.classList.add('show');
            const progress = notificationElement.querySelector('.notification-progress');
            progress.classList.add('animate');
        });

        // Auto-remove notification
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, this.notificationTimeout);
    }

    removeNotification(id) {
        const notification = this.shadowRoot.querySelector(`.notification[data-id="${id}"]`);
        if (notification) {
            notification.classList.add('hide');
            notification.addEventListener('transitionend', () => {
                notification.remove();
            });
        }
    }

    addEventListeners() {
        this.shadowRoot.addEventListener('click', (e) => {
            const closeButton = e.target.closest('.notification-close');
            if (closeButton) {
                const notification = closeButton.closest('.notification');
                this.removeNotification(notification.dataset.id);
            }

            const actionButton = e.target.closest('.notification-button');
            if (actionButton) {
                const notification = actionButton.closest('.notification');
                const action = actionButton.dataset.action;
                this.handleNotificationAction(notification.dataset.id, action);
            }
        });
    }

    handleNotificationAction(id, action) {
        const notification = this.notifications.find(n => n.id === parseInt(id));
        if (notification) {
            const actionHandler = notification.actions.find(a => a.type === action);
            if (actionHandler && actionHandler.handler) {
                actionHandler.handler();
            }
        }
        this.removeNotification(id);
    }
}

customElements.define('news-updates', NewsUpdates); 