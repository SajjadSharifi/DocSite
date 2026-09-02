class ThemeManager {
    constructor() {
        this.themeIcon = document.querySelector('.theme-icon use');
        this.init();
    }

    init() {
        this.loadTheme();
        this.setupEventListeners();
    }

    toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');

        if (currentTheme === 'dark') {
            body.removeAttribute('data-theme');
            this.themeIcon.setAttribute('href', '#icon-moon');
            localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            this.themeIcon.setAttribute('href', '#icon-sun');
            localStorage.setItem('theme', 'dark');
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            if (this.themeIcon) {
                this.themeIcon.setAttribute('href', '#icon-sun');
            }
        }
    }

    setupEventListeners() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
}

window.ThemeManager = ThemeManager;