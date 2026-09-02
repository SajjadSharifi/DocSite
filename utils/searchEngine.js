const fsPromises = require('fs').promises;
const path = require('path');

class SearchEngine {
    constructor() {
        this.index = [];
        this.lastBuildTime = 0;
        this.cacheTimeout = 30000; // 30 ثانیه
    }

    // ساخت ایندکس جستجو
    async buildIndex(docsPath) {
        const currentTime = Date.now();

        // اگر ایندکس تازه است، از همان استفاده کن
        if (this.index.length > 0 && (currentTime - this.lastBuildTime) < this.cacheTimeout) {
            return this.index;
        }

        console.log('Building search index...');
        this.index = [];

        try {
            const files = await this.getAllFiles(docsPath);

            for (const file of files) {
                const content = await fsPromises.readFile(file.fullPath, 'utf-8');

                if (file.extension === '.ipynb') {
                    // پردازش Jupyter Notebook
                    await this.indexJupyterNotebook(file, content);
                } else {
                    // پردازش Markdown
                    await this.indexMarkdownFile(file, content);
                }
            }

            this.lastBuildTime = currentTime;
            console.log(`Search index built with ${this.index.length} entries`);
        } catch (error) {
            console.error('Error building search index:', error);
        }

        return this.index;
    }

    // دریافت همه فایل‌های مستندات
    async getAllFiles(dirPath, basePath = '') {
        const files = [];

        try {
            const items = await fsPromises.readdir(dirPath);

            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const relativePath = path.join(basePath, item);
                const stat = await fsPromises.stat(fullPath);

                if (stat.isDirectory()) {
                    const subFiles = await this.getAllFiles(fullPath, relativePath);
                    files.push(...subFiles);
                } else if (this.isDocumentationFile(item)) {
                    files.push({
                        fullPath,
                        relativePath,
                        name: item,
                        extension: path.extname(item).toLowerCase()
                    });
                }
            }
        } catch (error) {
            console.error(`Error reading directory: ${dirPath}`, error);
        }

        return files;
    }

    isDocumentationFile(filename) {
        const docExtensions = ['.md', '.markdown', '.ipynb'];
        return docExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    }

    // ایندکس فایل Markdown
    async indexMarkdownFile(file, content) {
        const lines = content.split('\n');
        let currentHeading = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // تشخیص هدینگ‌ها
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                currentHeading = headingMatch[2].trim();
            }

            // ایندکس خطوط غیر خالی
            if (line.trim().length > 0) {
                this.index.push({
                    content: line.trim(),
                    heading: currentHeading,
                    filePath: file.relativePath,
                    fileName: file.name.replace(/\.(md|markdown)$/, ''),
                    lineNumber: i + 1,
                    type: 'markdown'
                });
            }
        }
    }

    // ایندکس Jupyter Notebook
    async indexJupyterNotebook(file, content) {
        try {
            const notebook = JSON.parse(content);

            if (notebook.cells && Array.isArray(notebook.cells)) {
                for (let i = 0; i < notebook.cells.length; i++) {
                    const cell = notebook.cells[i];
                    const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;

                    if (source.trim().length > 0) {
                        this.index.push({
                            content: source.trim(),
                            heading: cell.cell_type === 'markdown' ? 'Markdown Cell' : 'Code Cell',
                            filePath: file.relativePath,
                            fileName: file.name.replace(/\.ipynb$/, ''),
                            lineNumber: i + 1,
                            type: 'jupyter'
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`Error parsing Jupyter notebook: ${file.fullPath}`, error);
        }
    }

    // جستجو در ایندکس
    async search(query, docsPath, limit = 20) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const searchTerm = query.toLowerCase().trim();
        const index = await this.buildIndex(docsPath);

        const results = [];
        const seenContent = new Set(); // جلوگیری از نتایج تکراری

        for (const entry of index) {
            const contentLower = entry.content.toLowerCase();

            if (contentLower.includes(searchTerm)) {
                const key = `${entry.filePath}-${entry.content.substring(0, 50)}`;

                if (!seenContent.has(key)) {
                    seenContent.add(key);

                    results.push({
                        ...entry,
                        preview: this.generatePreview(entry.content, searchTerm),
                        score: this.calculateScore(entry, searchTerm)
                    });
                }
            }
        }

        // مرتب‌سازی بر اساس امتیاز
        results.sort((a, b) => b.score - a.score);

        return results.slice(0, limit);
    }

    // تولید پیش‌نمایش از متن
    generatePreview(content, searchTerm) {
        const maxLength = 150;
        const contentLower = content.toLowerCase();
        const termIndex = contentLower.indexOf(searchTerm);

        if (termIndex === -1) {
            return content.substring(0, maxLength) + '...';
        }

        const start = Math.max(0, termIndex - 50);
        const end = Math.min(content.length, termIndex + searchTerm.length + 100);

        let preview = '';
        if (start > 0) preview += '...';
        preview += content.substring(start, end);
        if (end < content.length) preview += '...';

        return preview;
    }

    // محاسبه امتیاز نتیجه
    calculateScore(entry, searchTerm) {
        let score = 0;
        const contentLower = entry.content.toLowerCase();

        // تطابق دقیق
        if (contentLower === searchTerm) {
            score += 100;
        }

        // شروع با عبارت جستجو
        if (contentLower.startsWith(searchTerm)) {
            score += 50;
        }

        // در عنوان
        if (entry.fileName.toLowerCase().includes(searchTerm)) {
            score += 30;
        }

        // در هدینگ
        if (entry.heading && entry.heading.toLowerCase().includes(searchTerm)) {
            score += 20;
        }

        // طول محتوا (کوتاه‌تر بهتر)
        score += Math.max(0, 10 - Math.floor(entry.content.length / 100));

        return score;
    }

    // پاک کردن ایندکس
    clearIndex() {
        this.index = [];
        this.lastBuildTime = 0;
    }
}

// Singleton
module.exports = new SearchEngine();