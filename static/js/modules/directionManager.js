class DirectionManager {
    constructor() {
        this.currentMode = 'default'; // 'default' | 'rtl' | 'ltr'
        this.storageKey = 'docs-direction-mode';
        this.init();
    }

    init() {
        this.loadPreference();
        this.buildToggleBar();
        this.applyDirection();

        // Re-apply after MathJax and dynamic content rendering
        setTimeout(() => this.applyDirection(), 500);
        setTimeout(() => this.applyDirection(), 1500);
    }

    loadPreference() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved && ['default', 'rtl', 'ltr'].includes(saved)) {
            this.currentMode = saved;
        }
    }

    savePreference() {
        localStorage.setItem(this.storageKey, this.currentMode);
    }

    buildToggleBar() {
        const content = document.querySelector('.document-content');
        if (!content) return;

        // Remove existing bar if any
        const existing = content.querySelector('.direction-toggle-bar');
        if (existing) existing.remove();

        const bar = document.createElement('div');
        bar.className = 'direction-toggle-bar';
        // Force LTR on the bar itself to prevent mirroring
        bar.setAttribute('dir', 'ltr');
        bar.innerHTML = `
            <div class="direction-toggle-label">
                <svg class="icon"><use href="#icon-type"></use></svg>
                <span>Text Direction</span>
            </div>
            <div class="direction-toggle-buttons">
                <button class="direction-btn" data-mode="rtl" title="Right-to-Left">
                    <span>RTL</span>
                </button>
                <button class="direction-btn" data-mode="ltr" title="Left-to-Right">
                    <span>LTR</span>
                </button>
                <button class="direction-btn" data-mode="default" title="Auto detect (like Obsidian)">
                    <span>Auto</span>
                </button>
            </div>
        `;

        // Insert at the beginning of the content
        content.insertBefore(bar, content.firstChild);

        // Attach event listeners
        bar.querySelectorAll('.direction-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setMode(btn.getAttribute('data-mode'));
            });
        });

        // Update button states
        this.updateActiveButton();
    }

    setMode(mode) {
        if (!['default', 'rtl', 'ltr'].includes(mode)) return;

        this.currentMode = mode;
        this.savePreference();
        this.updateActiveButton();
        this.applyDirection();
    }

    updateActiveButton() {
        document.querySelectorAll('.direction-btn').forEach(btn => {
            const isActive = btn.getAttribute('data-mode') === this.currentMode;
            btn.classList.toggle('active', isActive);
        });
    }

    applyDirection() {
        const content = document.querySelector('.document-content');
        if (!content) return;

        if (this.currentMode === 'rtl') {
            this.applyRTL(content);
        } else if (this.currentMode === 'ltr') {
            this.applyLTR(content);
        } else {
            this.applyAuto(content);
        }
    }

    // Force RTL on all text elements (skip the toggle bar and code blocks)
    applyRTL(content) {
        content.setAttribute('dir', 'rtl');
        content.style.direction = 'rtl';

        const elements = content.querySelectorAll(
            'p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, .cell-content'
        );

        elements.forEach(el => {
            // Skip elements inside the direction toggle bar
            if (el.closest('.direction-toggle-bar')) return;
            // Skip code elements
            if (el.closest('pre') || el.closest('code')) return;

            el.setAttribute('dir', 'rtl');
            el.style.direction = 'rtl';
            el.style.textAlign = 'right';
        });
    }

    // Force LTR on all text elements (skip the toggle bar and code blocks)
    applyLTR(content) {
        content.setAttribute('dir', 'ltr');
        content.style.direction = 'ltr';

        const elements = content.querySelectorAll(
            'p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, .cell-content'
        );

        elements.forEach(el => {
            // Skip elements inside the direction toggle bar
            if (el.closest('.direction-toggle-bar')) return;
            // Skip code elements
            if (el.closest('pre') || el.closest('code')) return;

            el.setAttribute('dir', 'ltr');
            el.style.direction = 'ltr';
            el.style.textAlign = 'left';
        });
    }

    // Auto-detect direction per element (like Obsidian)
    applyAuto(content) {
        content.removeAttribute('dir');
        content.style.direction = '';

        const elements = content.querySelectorAll(
            'p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, .cell-content'
        );

        elements.forEach(el => {
            // Skip code elements and direction toggle bar
            if (el.closest('pre') || el.closest('code')) return;
            if (el.closest('.direction-toggle-bar')) return;

            const text = el.textContent.trim();
            if (!text) return;

            const direction = this.detectDirection(text);

            el.setAttribute('dir', direction);
            el.style.direction = direction;
            el.style.textAlign = direction === 'rtl' ? 'right' : 'left';
        });
    }

    // Detect direction based on the first meaningful character
    detectDirection(text) {
        // Strip leading whitespace and invisible characters
        const trimmed = text.replace(/^[\s\u200c\u200f\u200e"']+/, '');

        if (!trimmed) return 'rtl';

        const firstChar = trimmed.charAt(0);
        const code = firstChar.charCodeAt(0);

        // Persian / Arabic / Hebrew Unicode ranges
        if (
            (code >= 0x0600 && code <= 0x06FF) || // Arabic
            (code >= 0x0750 && code <= 0x077F) || // Arabic Supplement
            (code >= 0x08A0 && code <= 0x08FF) || // Arabic Extended-A
            (code >= 0xFB50 && code <= 0xFDFF) || // Arabic Presentation Forms-A
            (code >= 0xFE70 && code <= 0xFEFF) || // Arabic Presentation Forms-B
            (code >= 0x0590 && code <= 0x05FF)    // Hebrew
        ) {
            return 'rtl';
        }

        // Latin letters and digits
        if (/[a-zA-Z0-9]/.test(firstChar)) {
            return 'ltr';
        }

        return 'rtl'; // Fallback
    }
}

window.DirectionManager = DirectionManager;