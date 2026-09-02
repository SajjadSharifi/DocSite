class SearchManager {
    constructor() {
        this.searchModal = document.getElementById('searchModal');
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.searchButton = document.getElementById('searchButton');
        this.debounceTimer = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.searchButton) {
            this.searchButton.addEventListener('click', () => this.openModal());
        }

        const overlay = this.searchModal.querySelector('.search-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeModal());
        }

        const closeButton = this.searchModal.querySelector('.search-modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeModal());
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.handleSearchWithDebounce());
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchModal.classList.contains('active')) {
                this.closeModal();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openModal();
            }
        });
    }

    handleSearchWithDebounce() {
        clearTimeout(this.debounceTimer);

        this.debounceTimer = setTimeout(() => {
            this.performSearch();
        }, 300);
    }

    async performSearch() {
        const query = this.searchInput.value.trim();

        if (!query || query.length < 2) {
            this.showEmptyState();
            return;
        }

        try {
            this.showLoading();

            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.success) {
                this.displayResults(data.results);
            } else {
                this.showError();
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError();
        }
    }

    openModal() {
        this.searchModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            this.searchInput.focus();
        }, 100);

        this.searchInput.value = '';
        this.showEmptyState();
    }

    closeModal() {
        this.searchModal.classList.remove('active');
        document.body.style.overflow = '';
        this.searchInput.value = '';
        this.searchResults.innerHTML = '';
    }

    showLoading() {
        this.searchResults.innerHTML = `
            <div class="search-loading">
                <div class="spinner"></div>
                <p>در حال جستجو...</p>
            </div>
        `;
    }

    showEmptyState() {
        this.searchResults.innerHTML = `
            <div class="search-empty">
                <svg class="icon"><use href="#icon-search"></use></svg>
                <p>برای جستجو شروع به تایپ کنید...</p>
            </div>
        `;
    }

    showError() {
        this.searchResults.innerHTML = `
            <div class="search-empty">
                <svg class="icon"><use href="#icon-close"></use></svg>
                <p>خطایی در جستجو رخ داد</p>
            </div>
        `;
    }

    displayResults(results) {
        if (!results || results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-empty">
                    <svg class="icon"><use href="#icon-search"></use></svg>
                    <p>نتیجه‌ای یافت نشد</p>
                </div>
            `;
            return;
        }

        this.searchResults.innerHTML = results.map(result => {
            const lineId = `line-${result.lineNumber}`;
            const currentPath = this.getCurrentPath();
            const targetPath = result.filePath;

            // بررسی آیا در همان فایل هستیم
            const isSameFile = currentPath === targetPath;

            return `
                <div class="search-result-item" data-line-id="${lineId}" data-path="${targetPath}">
                    <div class="search-result-icon">
                        <svg class="icon">
                            <use href="${result.type === 'jupyter' ? '#icon-jupyter' : '#icon-file'}"></use>
                        </svg>
                    </div>
                    <div class="search-result-info">
                        <div class="search-result-title">${this.escapeHtml(result.fileName)}</div>
                        ${result.heading ? `<div class="search-result-heading">${this.escapeHtml(result.heading)}</div>` : ''}
                        <div class="search-result-preview">${this.escapeHtml(result.preview)}</div>
                        <div class="search-result-path">خط ${result.lineNumber}</div>
                    </div>
                </div>
            `;
        }).join('');

        // اضافه کردن event listener برای هر نتیجه
        this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const lineId = item.getAttribute('data-line-id');
                const targetPath = item.getAttribute('data-path');

                this.handleResultClick(lineId, targetPath);
            });
        });
    }

    handleResultClick(lineId, targetPath) {
        const currentPath = this.getCurrentPath();

        // بستن modal
        this.closeModal();

        if (currentPath === targetPath) {
            // در همان فایل هستیم - فقط اسکرول به بخش مورد نظر
            this.scrollToElement(lineId);
        } else {
            // در فایل دیگر - ریدایرکت به فایل با hash
            window.location.href = `/docs/${targetPath}#${lineId}`;
        }
    }

    scrollToElement(elementId) {
        const targetElement = document.getElementById(elementId);

        if (targetElement) {
            // اسکرول نرم به عنصر
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            // اضافه کردن highlight
            targetElement.classList.add('highlight-target');

            setTimeout(() => {
                targetElement.classList.remove('highlight-target');
            }, 3000);
        }
    }

    getCurrentPath() {
        // استخراج مسیر فعلی از URL
        const path = window.location.pathname;
        const match = path.match(/^\/docs\/(.+)$/);
        return match ? match[1] : '';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

window.SearchManager = SearchManager;