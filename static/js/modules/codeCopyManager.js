class CodeCopyManager {
    constructor() {
        this.init();
    }

    init() {
        this.addCopyButtons();
    }

    addCopyButtons() {
        const codeBlocks = document.querySelectorAll('.document-content pre, .cell-input pre');

        codeBlocks.forEach(block => {
            if (block.querySelector('.copy-button')) {
                return;
            }

            block.style.position = 'relative';

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.setAttribute('title', 'کپی کد');

            // استفاده از SVG inline
            copyButton.innerHTML = '<svg class="icon"><use href="#icon-copy"></use></svg>';

            copyButton.addEventListener('click', () => this.copyCode(copyButton, block));

            block.appendChild(copyButton);
        });
    }

    copyCode(button, block) {
        const codeElement = block.querySelector('code');

        if (codeElement) {
            navigator.clipboard.writeText(codeElement.textContent).then(() => {
                button.innerHTML = '<svg class="icon"><use href="#icon-check"></use></svg>';
                button.style.opacity = '1';
                button.style.color = '#4CAF50';
                button.style.borderColor = '#4CAF50';

                setTimeout(() => {
                    button.innerHTML = '<svg class="icon"><use href="#icon-copy"></use></svg>';
                    button.style.color = '';
                    button.style.borderColor = '';
                    button.style.opacity = '';
                }, 1500);
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        }
    }
}

window.CodeCopyManager = CodeCopyManager;