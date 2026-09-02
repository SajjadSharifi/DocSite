class MathManager {
    constructor() {
        this.init();
    }

    init() {
        this.processMathFormulas();
        this.setupDirection();
    }

    processMathFormulas() {
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise().catch((err) => {
                console.log('MathJax typeset failed:', err);
            });
        }

        // پردازش دستی فرمول‌ها
        const contentAreas = document.querySelectorAll('.document-content, .markdown-cell .cell-content');

        contentAreas.forEach(area => {
            let html = area.innerHTML;

            // فرمول‌های display math
            html = html.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
                return `<div class="math-display">$${formula.trim()}$</div>`;
            });

            // فرمول‌های inline math
            html = html.replace(/(?<!\$)\$([^\$\n]+?)\$(?!\$)/g, (match, formula) => {
                return `<span class="math-inline">$${formula.trim()}$</span>`;
            });

            area.innerHTML = html;
        });
    }

    setupDirection() {
        document.querySelectorAll('pre, code, .cell-input').forEach(element => {
            element.setAttribute('dir', 'ltr');
        });

        document.querySelectorAll('.math-display, .math-inline').forEach(element => {
            element.setAttribute('dir', 'ltr');
        });

        document.querySelectorAll('.document-content p, .markdown-cell p').forEach(element => {
            if (!element.closest('pre') && !element.closest('code')) {
                element.setAttribute('dir', 'rtl');
            }
        });
    }
}

// Export برای استفاده در main.js
window.MathManager = MathManager;