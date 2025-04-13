class NewsSearch extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.searchTimeout = null;
        this.filters = {
            categories: new Set(),
            sources: new Set(),
            dateRange: {
                start: null,
                end: null
            },
            sortBy: 'relevance',
            language: 'en'
        };
    }

    connectedCallback() {
        this.render();
        this.initializeDatePicker();
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 2rem;
                }

                .search-container {
                    background: var(--surface-color);
                    border-radius: 0.5rem;
                    padding: 1.5rem;
                    box-shadow: var(--shadow-sm);
                }

                .search-header {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .search-input-container {
                    position: relative;
                    flex: 1;
                }

                .search-input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 2.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    background: var(--background-color);
                    color: var(--text-primary);
                    font-size: 1rem;
                    transition: all 0.2s;
                }

                .search-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
                }

                .search-icon {
                    position: absolute;
                    left: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                }

                .search-button {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 0.5rem;
                    background: var(--primary-color);
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .search-button:hover {
                    background: var(--primary-color-dark);
                }

                .filters-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .filter-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .filter-select {
                    padding: 0.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    background: var(--background-color);
                    color: var(--text-primary);
                    cursor: pointer;
                }

                .filter-select:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }

                .date-range {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem;
                }

                .date-input {
                    padding: 0.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    background: var(--background-color);
                    color: var(--text-primary);
                }

                .advanced-filters {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border-color);
                }

                .advanced-filters-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .advanced-filters-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                }

                .toggle-advanced {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    border: none;
                    background: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                }

                .toggle-advanced i {
                    transition: transform 0.2s;
                }

                .toggle-advanced.active i {
                    transform: rotate(180deg);
                }

                .advanced-filters-content {
                    display: none;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .advanced-filters-content.show {
                    display: grid;
                }

                .filter-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }

                .filter-tag {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    background: var(--primary-color-light);
                    color: var(--primary-color);
                    font-size: 0.875rem;
                }

                .filter-tag-remove {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 16px;
                    height: 16px;
                    border: none;
                    background: none;
                    color: inherit;
                    cursor: pointer;
                    font-size: 0.75rem;
                }

                .search-results {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border-color);
                }

                .search-results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .search-results-count {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .search-results-sort {
                    display: flex;
                    gap: 0.5rem;
                }

                .sort-button {
                    padding: 0.25rem 0.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.25rem;
                    background: var(--background-color);
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    cursor: pointer;
                }

                .sort-button.active {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }

                @media (max-width: 768px) {
                    .search-header {
                        flex-direction: column;
                    }

                    .search-button {
                        width: 100%;
                    }

                    .filters-container {
                        grid-template-columns: 1fr;
                    }

                    .date-range {
                        grid-template-columns: 1fr;
                    }
                }
            </style>

            <div class="search-container">
                <div class="search-header">
                    <div class="search-input-container">
                        <i class="fas fa-search search-icon"></i>
                        <input 
                            type="text" 
                            class="search-input" 
                            placeholder="Search articles..."
                        >
                    </div>
                    <button class="search-button">
                        Search
                    </button>
                </div>

                <div class="filters-container">
                    <div class="filter-group">
                        <label class="filter-label">Category</label>
                        <select class="filter-select" data-filter="category">
                            <option value="">All Categories</option>
                            <option value="general">General</option>
                            <option value="business">Business</option>
                            <option value="technology">Technology</option>
                            <option value="science">Science</option>
                            <option value="health">Health</option>
                            <option value="sports">Sports</option>
                            <option value="entertainment">Entertainment</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">Source</label>
                        <select class="filter-select" data-filter="source">
                            <option value="">All Sources</option>
                            <option value="bbc-news">BBC News</option>
                            <option value="cnn">CNN</option>
                            <option value="reuters">Reuters</option>
                            <option value="the-verge">The Verge</option>
                            <option value="techcrunch">TechCrunch</option>
                            <option value="wired">Wired</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">Date Range</label>
                        <div class="date-range">
                            <input type="date" class="date-input" id="startDate">
                            <input type="date" class="date-input" id="endDate">
                        </div>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">Sort By</label>
                        <select class="filter-select" data-filter="sort">
                            <option value="relevance">Relevance</option>
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="popular">Most Popular</option>
                        </select>
                    </div>
                </div>

                <div class="advanced-filters">
                    <div class="advanced-filters-header">
                        <h3 class="advanced-filters-title">Advanced Filters</h3>
                        <button class="toggle-advanced">
                            <span>Show Advanced</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>

                    <div class="advanced-filters-content">
                        <div class="filter-group">
                            <label class="filter-label">Language</label>
                            <select class="filter-select" data-filter="language">
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="it">Italian</option>
                            </select>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">Content Type</label>
                            <select class="filter-select" data-filter="content-type">
                                <option value="">All Types</option>
                                <option value="article">Articles</option>
                                <option value="video">Videos</option>
                                <option value="podcast">Podcasts</option>
                            </select>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">Reading Time</label>
                            <select class="filter-select" data-filter="reading-time">
                                <option value="">Any Time</option>
                                <option value="short">Short (1-5 min)</option>
                                <option value="medium">Medium (5-10 min)</option>
                                <option value="long">Long (10+ min)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="filter-tags"></div>
            </div>
        `;
    }

    initializeDatePicker() {
        const startDate = this.shadowRoot.querySelector('#startDate');
        const endDate = this.shadowRoot.querySelector('#endDate');

        // Set max date to today
        const today = new Date().toISOString().split('T')[0];
        startDate.max = today;
        endDate.max = today;

        // Update end date min when start date changes
        startDate.addEventListener('change', () => {
            endDate.min = startDate.value;
            this.filters.dateRange.start = startDate.value;
            this.updateFilterTags();
        });

        endDate.addEventListener('change', () => {
            this.filters.dateRange.end = endDate.value;
            this.updateFilterTags();
        });
    }

    addEventListeners() {
        // Search input
        const searchInput = this.shadowRoot.querySelector('.search-input');
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.dispatchSearchEvent();
            }, 300);
        });

        // Search button
        const searchButton = this.shadowRoot.querySelector('.search-button');
        searchButton.addEventListener('click', () => {
            this.dispatchSearchEvent();
        });

        // Filter selects
        const filterSelects = this.shadowRoot.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const filter = e.target.dataset.filter;
                const value = e.target.value;
                
                if (filter === 'category' || filter === 'source') {
                    if (value) {
                        this.filters[filter + 's'].add(value);
                    }
                } else {
                    this.filters[filter] = value;
                }

                this.updateFilterTags();
                this.dispatchSearchEvent();
            });
        });

        // Advanced filters toggle
        const toggleButton = this.shadowRoot.querySelector('.toggle-advanced');
        const advancedContent = this.shadowRoot.querySelector('.advanced-filters-content');
        
        toggleButton.addEventListener('click', () => {
            toggleButton.classList.toggle('active');
            advancedContent.classList.toggle('show');
        });
    }

    updateFilterTags() {
        const tagsContainer = this.shadowRoot.querySelector('.filter-tags');
        tagsContainer.innerHTML = '';

        // Add category tags
        this.filters.categories.forEach(category => {
            this.addFilterTag(tagsContainer, 'category', category);
        });

        // Add source tags
        this.filters.sources.forEach(source => {
            this.addFilterTag(tagsContainer, 'source', source);
        });

        // Add date range tag
        if (this.filters.dateRange.start && this.filters.dateRange.end) {
            const startDate = new Date(this.filters.dateRange.start).toLocaleDateString();
            const endDate = new Date(this.filters.dateRange.end).toLocaleDateString();
            this.addFilterTag(tagsContainer, 'date', `${startDate} - ${endDate}`);
        }

        // Add sort tag
        if (this.filters.sortBy !== 'relevance') {
            this.addFilterTag(tagsContainer, 'sort', this.filters.sortBy);
        }

        // Add language tag
        if (this.filters.language !== 'en') {
            this.addFilterTag(tagsContainer, 'language', this.filters.language);
        }
    }

    addFilterTag(container, type, value) {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `
            <span>${value}</span>
            <button class="filter-tag-remove" data-type="${type}" data-value="${value}">
                &times;
            </button>
        `;

        const removeButton = tag.querySelector('.filter-tag-remove');
        removeButton.addEventListener('click', () => {
            this.removeFilter(type, value);
        });

        container.appendChild(tag);
    }

    removeFilter(type, value) {
        if (type === 'category') {
            this.filters.categories.delete(value);
        } else if (type === 'source') {
            this.filters.sources.delete(value);
        } else if (type === 'date') {
            this.filters.dateRange = { start: null, end: null };
            const startDate = this.shadowRoot.querySelector('#startDate');
            const endDate = this.shadowRoot.querySelector('#endDate');
            startDate.value = '';
            endDate.value = '';
        } else {
            this.filters[type] = type === 'sort' ? 'relevance' : 'en';
        }

        this.updateFilterTags();
        this.dispatchSearchEvent();
    }

    dispatchSearchEvent() {
        const searchInput = this.shadowRoot.querySelector('.search-input');
        const query = searchInput.value.trim();

        this.dispatchEvent(new CustomEvent('search', {
            detail: {
                query,
                filters: {
                    categories: Array.from(this.filters.categories),
                    sources: Array.from(this.filters.sources),
                    dateRange: this.filters.dateRange,
                    sortBy: this.filters.sortBy,
                    language: this.filters.language
                }
            },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('news-search', NewsSearch); 