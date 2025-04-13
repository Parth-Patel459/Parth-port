class NewsControls extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.searchTimeout = null;
        this.selectedCategories = new Set();
        this.selectedSources = new Set();
        this.dateRange = {
            start: null,
            end: null
        };
    }

    static get observedAttributes() {
        return ['categories', 'sources', 'view-mode'];
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
        this.initializeDatePicker();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background: var(--surface-color);
                    padding: 1rem;
                    border-radius: 0.5rem;
                    box-shadow: var(--shadow-sm);
                }

                .controls-container {
                    display: grid;
                    gap: 1rem;
                    grid-template-columns: 1fr auto;
                    align-items: center;
                }

                .search-container {
                    position: relative;
                    display: flex;
                    align-items: center;
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
                    color: var(--text-secondary);
                }

                .filters-container {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .filter-button {
                    padding: 0.5rem 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    background: var(--background-color);
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-button:hover {
                    background: var(--surface-color);
                }

                .filter-button.active {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }

                .view-toggle {
                    display: flex;
                    gap: 0.5rem;
                }

                .view-button {
                    padding: 0.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    background: var(--background-color);
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .view-button:hover {
                    background: var(--surface-color);
                }

                .view-button.active {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }

                .filter-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .filter-modal.active {
                    display: flex;
                }

                .filter-content {
                    background: var(--background-color);
                    padding: 2rem;
                    border-radius: 1rem;
                    width: 90%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .filter-section {
                    margin-bottom: 2rem;
                }

                .filter-section h3 {
                    margin-bottom: 1rem;
                    color: var(--text-primary);
                }

                .filter-options {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 0.5rem;
                }

                .filter-option {
                    padding: 0.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    background: var(--surface-color);
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-option:hover {
                    background: var(--primary-color-light);
                }

                .filter-option.active {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }

                .date-range {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .date-input {
                    padding: 0.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    background: var(--surface-color);
                    color: var(--text-primary);
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 2rem;
                }

                .modal-button {
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .modal-button.apply {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                }

                .modal-button.cancel {
                    background: var(--surface-color);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }

                @media (max-width: 768px) {
                    .controls-container {
                        grid-template-columns: 1fr;
                    }

                    .filters-container {
                        flex-wrap: wrap;
                    }

                    .filter-content {
                        width: 95%;
                        padding: 1rem;
                    }

                    .filter-options {
                        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    }
                }
            </style>

            <div class="controls-container">
                <div class="search-container">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" class="search-input" placeholder="Search news...">
                </div>
                <div class="filters-container">
                    <button class="filter-button" data-filter="categories">
                        <i class="fas fa-filter"></i> Categories
                    </button>
                    <button class="filter-button" data-filter="sources">
                        <i class="fas fa-newspaper"></i> Sources
                    </button>
                    <button class="filter-button" data-filter="date">
                        <i class="fas fa-calendar"></i> Date
                    </button>
                    <div class="view-toggle">
                        <button class="view-button" data-view="grid">
                            <i class="fas fa-th"></i>
                        </button>
                        <button class="view-button" data-view="list">
                            <i class="fas fa-list"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="filter-modal" id="filterModal">
                <div class="filter-content">
                    <div class="filter-section" id="categoriesSection">
                        <h3>Categories</h3>
                        <div class="filter-options" id="categoryOptions">
                            <div class="filter-option" data-category="general">General</div>
                            <div class="filter-option" data-category="business">Business</div>
                            <div class="filter-option" data-category="technology">Technology</div>
                            <div class="filter-option" data-category="science">Science</div>
                            <div class="filter-option" data-category="health">Health</div>
                            <div class="filter-option" data-category="sports">Sports</div>
                            <div class="filter-option" data-category="entertainment">Entertainment</div>
                        </div>
                    </div>

                    <div class="filter-section" id="sourcesSection">
                        <h3>Sources</h3>
                        <div class="filter-options" id="sourceOptions">
                            <div class="filter-option" data-source="bbc-news">BBC News</div>
                            <div class="filter-option" data-source="cnn">CNN</div>
                            <div class="filter-option" data-source="reuters">Reuters</div>
                            <div class="filter-option" data-source="the-verge">The Verge</div>
                            <div class="filter-option" data-source="techcrunch">TechCrunch</div>
                            <div class="filter-option" data-source="wired">Wired</div>
                        </div>
                    </div>

                    <div class="filter-section" id="dateSection">
                        <h3>Date Range</h3>
                        <div class="date-range">
                            <input type="date" class="date-input" id="startDate">
                            <input type="date" class="date-input" id="endDate">
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="modal-button cancel">Cancel</button>
                        <button class="modal-button apply">Apply Filters</button>
                    </div>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        // Search input handler
        const searchInput = this.shadowRoot.querySelector('.search-input');
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.dispatchEvent(new CustomEvent('search', {
                    detail: { query: e.target.value },
                    bubbles: true,
                    composed: true
                }));
            }, 300);
        });

        // Filter buttons handler
        const filterButtons = this.shadowRoot.querySelectorAll('.filter-button');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filterType = button.dataset.filter;
                this.showFilterModal(filterType);
            });
        });

        // View toggle handler
        const viewButtons = this.shadowRoot.querySelectorAll('.view-button');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const viewMode = button.dataset.view;
                this.setViewMode(viewMode);
            });
        });

        // Filter options handler
        const categoryOptions = this.shadowRoot.querySelectorAll('.filter-option[data-category]');
        categoryOptions.forEach(option => {
            option.addEventListener('click', () => {
                option.classList.toggle('active');
                const category = option.dataset.category;
                if (option.classList.contains('active')) {
                    this.selectedCategories.add(category);
                } else {
                    this.selectedCategories.delete(category);
                }
            });
        });

        const sourceOptions = this.shadowRoot.querySelectorAll('.filter-option[data-source]');
        sourceOptions.forEach(option => {
            option.addEventListener('click', () => {
                option.classList.toggle('active');
                const source = option.dataset.source;
                if (option.classList.contains('active')) {
                    this.selectedSources.add(source);
                } else {
                    this.selectedSources.delete(source);
                }
            });
        });

        // Modal actions handler
        const modal = this.shadowRoot.querySelector('#filterModal');
        const cancelButton = this.shadowRoot.querySelector('.modal-button.cancel');
        const applyButton = this.shadowRoot.querySelector('.modal-button.apply');

        cancelButton.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        applyButton.addEventListener('click', () => {
            this.applyFilters();
            modal.classList.remove('active');
        });
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
            this.dateRange.start = startDate.value;
        });

        endDate.addEventListener('change', () => {
            this.dateRange.end = endDate.value;
        });
    }

    showFilterModal(filterType) {
        const modal = this.shadowRoot.querySelector('#filterModal');
        const sections = {
            categories: this.shadowRoot.querySelector('#categoriesSection'),
            sources: this.shadowRoot.querySelector('#sourcesSection'),
            date: this.shadowRoot.querySelector('#dateSection')
        };

        // Hide all sections
        Object.values(sections).forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        sections[filterType].style.display = 'block';
        modal.classList.add('active');
    }

    setViewMode(viewMode) {
        const viewButtons = this.shadowRoot.querySelectorAll('.view-button');
        viewButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.view === viewMode);
        });

        this.dispatchEvent(new CustomEvent('view-mode-change', {
            detail: { viewMode },
            bubbles: true,
            composed: true
        }));
    }

    applyFilters() {
        this.dispatchEvent(new CustomEvent('filters-change', {
            detail: {
                categories: Array.from(this.selectedCategories),
                sources: Array.from(this.selectedSources),
                dateRange: this.dateRange
            },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('news-controls', NewsControls); 