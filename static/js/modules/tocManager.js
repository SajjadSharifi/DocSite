class TocManager {
    constructor() {
        this.headings = [];
        this.scrollTimeout = null;
        this.headingPositions = new Map();
        this.init();
    }

    init() {
        this.collectHeadings();
        if (this.headings.length > 0) {
            this.buildDesktopToc();
            this.buildMobileToc();
            this.calculatePositions();
            this.setupScrollSpy();
        }
    }

    collectHeadings() {
        const content = document.querySelector('.document-content');
        if (!content) return;

        this.headings = Array.from(content.querySelectorAll('h1, h2, h3'));

        this.headings.forEach((heading, index) => {
            if (!heading.id) {
                heading.id = `section-${index}`;
            }
        });
    }

    calculatePositions() {
        this.headingPositions.clear();

        this.headings.forEach((heading) => {
            const rect = heading.getBoundingClientRect();
            const absoluteTop = rect.top + window.pageYOffset;

            this.headingPositions.set(heading.id, absoluteTop);
            heading.setAttribute('data-position', absoluteTop);
        });
    }

    buildDesktopToc() {
        const tocContainer = document.getElementById('tocContainer');
        if (!tocContainer) return;

        tocContainer.innerHTML = '';

        const tocHeader = document.createElement('div');
        tocHeader.className = 'toc-header';
        tocHeader.textContent = 'در این صفحه';

        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';

        this.headings.forEach((heading) => {
            const tocItem = document.createElement('li');
            tocItem.className = 'toc-item';

            const tocLink = document.createElement('a');
            tocLink.href = `#${heading.id}`;
            tocLink.className = `toc-link toc-${heading.tagName.toLowerCase()}`;
            tocLink.textContent = heading.textContent;
            tocLink.setAttribute('data-heading-id', heading.id);

            tocLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToHeading(heading.id);
            });

            tocItem.appendChild(tocLink);
            tocList.appendChild(tocItem);
        });

        tocContainer.appendChild(tocHeader);
        tocContainer.appendChild(tocList);
    }

    buildMobileToc() {
        const mobileTocContent = document.getElementById('mobileTocContent');
        if (!mobileTocContent) return;

        mobileTocContent.innerHTML = '';

        this.headings.forEach((heading) => {
            const mobileTocLink = document.createElement('a');
            mobileTocLink.href = `#${heading.id}`;
            mobileTocLink.className = `toc-link toc-${heading.tagName.toLowerCase()}`;
            mobileTocLink.textContent = heading.textContent;
            mobileTocLink.setAttribute('data-heading-id', heading.id);

            mobileTocLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToHeading(heading.id);

                const mobileToc = document.getElementById('mobileToc');
                if (mobileToc) {
                    mobileToc.classList.remove('active');
                }
            });

            mobileTocContent.appendChild(mobileTocLink);
        });
    }

    scrollToHeading(headingId) {
        const position = this.headingPositions.get(headingId);

        if (position !== undefined) {
            window.scrollTo({
                top: position - 80,
                behavior: 'smooth'
            });

            this.updateActiveLinks(headingId);
        }
    }

    setupScrollSpy() {
        window.addEventListener('scroll', () => {
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }

            this.scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 100);
        }, { passive: true });

        setTimeout(() => {
            this.calculatePositions();
            this.handleScroll();
        }, 1000);

        setTimeout(() => {
            this.calculatePositions();
            this.handleScroll();
        }, 2000);
    }

    handleScroll() {
        if (this.headings.length === 0) return;

        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        let currentHeadingId = this.headings[0].id;

        for (let i = 0; i < this.headings.length; i++) {
            const heading = this.headings[i];
            const position = this.headingPositions.get(heading.id);

            if (position !== undefined && position <= scrollY + 150) {
                currentHeadingId = heading.id;
            }
        }

        this.updateActiveLinks(currentHeadingId);
    }

    updateActiveLinks(activeId) {
        const currentIndex = this.headings.findIndex(h => h.id === activeId);

        if (currentIndex === -1) return;

        const allLinks = document.querySelectorAll('.toc-link');

        allLinks.forEach((link) => {
            const linkHeadingId = link.getAttribute('data-heading-id');
            const linkIndex = this.headings.findIndex(h => h.id === linkHeadingId);

            if (linkIndex === -1) return;

            link.classList.remove('active', 'passed');

            if (linkIndex === currentIndex) {
                link.classList.add('active');
            } else if (linkIndex < currentIndex) {
                link.classList.add('passed');
            }
        });
    }
}

window.TocManager = TocManager;