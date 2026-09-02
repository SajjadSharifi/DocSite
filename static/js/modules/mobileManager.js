class MobileManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.mobileToc = document.getElementById('mobileToc');
        this.overlay = document.getElementById('sidebarOverlay');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.handleResize();
    }

    getDisplayMode() {
        const width = window.innerWidth;

        if (width <= 960) {
            return 'mobile';
        } else if (width <= 1230) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    toggleMobileSidebar() {
        const mode = this.getDisplayMode();

        if (mode === 'mobile' || mode === 'tablet') {
            this.sidebar.classList.toggle('mobile-open');
            this.overlay.classList.toggle('active');
        }
    }

    closeMobileSidebar() {
        this.sidebar.classList.remove('mobile-open');
        this.overlay.classList.remove('active');
    }

    toggleMobileToc() {
        const mode = this.getDisplayMode();

        if (mode === 'mobile') {
            this.mobileToc.classList.toggle('active');
        }
    }

    setupEventListeners() {
        const hamburger = document.querySelector('.hamburger-menu');
        if (hamburger) {
            hamburger.addEventListener('click', () => this.toggleMobileSidebar());
        }

        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeMobileSidebar());
        }

        const mobileTocButton = document.getElementById('mobileTocButton');
        if (mobileTocButton) {
            mobileTocButton.addEventListener('click', () => this.toggleMobileToc());
        }

        const mobileTocClose = document.querySelector('.mobile-toc-header button');
        if (mobileTocClose) {
            mobileTocClose.addEventListener('click', () => this.toggleMobileToc());
        }

        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        const mode = this.getDisplayMode();

        if (mode === 'desktop') {
            this.closeMobileSidebar();
            this.mobileToc.classList.remove('active');
        }
    }
}

window.MobileManager = MobileManager;