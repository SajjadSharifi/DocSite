class App {
    constructor() {
        this.initManagers();
    }

    initManagers() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.themeManager = new ThemeManager();
        this.mobileManager = new MobileManager();
        this.searchManager = new SearchManager();

        setTimeout(() => {
            this.tocManager = new TocManager();
        }, 500);

        this.codeCopyManager = new CodeCopyManager();
        this.mathManager = new MathManager();
        this.uiManager = new UiManager();

        this.handleInitialHash();
    }

    handleInitialHash() {
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1);

            setTimeout(() => {
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'auto'
                    });

                    targetElement.classList.add('highlight-target');

                    setTimeout(() => {
                        targetElement.classList.remove('highlight-target');
                    }, 3000);
                }
            }, 1000);
        }
    }
}

const app = new App();