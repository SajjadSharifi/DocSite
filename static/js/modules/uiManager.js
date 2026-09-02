class UiManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupFolderToggle();
        this.setupSmoothScroll();
        this.setupExternalLinks();
        this.setupKeyboardShortcuts();
        this.replaceNavigationIcons();
        this.setupImageViewer(); // جدید
    }

    setupImageViewer() {
        // ایجاد viewer
        const viewer = document.createElement('div');
        viewer.className = 'image-viewer';
        viewer.id = 'imageViewer';
        document.body.appendChild(viewer);

        // کلیک روی تصاویر
        document.addEventListener('click', (e) => {
            const img = e.target.closest('.document-content img, .markdown-cell img');

            if (img) {
                viewer.innerHTML = '';
                const clonedImg = img.cloneNode(true);
                viewer.appendChild(clonedImg);
                viewer.classList.add('active');
            }
        });

        // بستن viewer
        viewer.addEventListener('click', () => {
            viewer.classList.remove('active');
            viewer.innerHTML = '';
        });

        // بستن با Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                viewer.classList.remove('active');
                viewer.innerHTML = '';
            }
        });
    }


    replaceNavigationIcons() {
        document.querySelectorAll('.folder-icon').forEach(icon => {
            if (icon.textContent === '📁') {
                icon.innerHTML = '<svg class="icon"><use href="#icon-folder"></use></svg>';
            }
        });

        document.querySelectorAll('.file-icon').forEach(icon => {
            if (icon.textContent === '📄') {
                icon.innerHTML = '<svg class="icon"><use href="#icon-file"></use></svg>';
            } else if (icon.textContent === '📓') {
                icon.innerHTML = '<svg class="icon"><use href="#icon-jupyter"></use></svg>';
            }
        });
    }

    setupFolderToggle() {
        document.querySelectorAll('.nav-folder-header').forEach(header => {
            header.addEventListener('click', () => {
                const folderItem = header.parentElement;
                const folderContent = header.nextElementSibling;
                const chevron = header.querySelector('.chevron');

                folderItem.classList.toggle('open');

                if (folderItem.classList.contains('open')) {
                    folderContent.style.display = 'block';
                    chevron.textContent = '▼';
                } else {
                    folderContent.style.display = 'none';
                    chevron.textContent = '▶';
                }
            });
        });
    }

    setupSmoothScroll() {
        window.addEventListener('load', function () {
            if (window.location.hash) {
                const element = document.querySelector(window.location.hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    setupExternalLinks() {
        const links = document.querySelectorAll('a[href^="http"]');

        links.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');

            if (!link.querySelector('.external-link-icon')) {
                const icon = document.createElement('span');
                icon.className = 'external-link-icon';
                icon.textContent = ' ↗';
                icon.style.cssText = `
                    font-size: 0.8em;
                    color: #999;
                `;
                link.appendChild(icon);
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('search');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            if (e.key === 'Escape') {
                const sidebar = document.getElementById('sidebar');
                const mobileToc = document.getElementById('mobileToc');
                const overlay = document.getElementById('sidebarOverlay');

                if (sidebar) sidebar.classList.remove('mobile-open');
                if (mobileToc) mobileToc.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            }
        });
    }
}

window.UiManager = UiManager;