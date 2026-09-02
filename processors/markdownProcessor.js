const fsPromises = require('fs').promises;
const path = require('path');
const marked = require('marked');
const hljs = require('highlight.js');

class MarkdownProcessor {
    constructor() {
        this.configureMarked();
    }

    configureMarked() {
        marked.setOptions({
            highlight: function (code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(lang, code).value;
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true
        });
    }

    // بررسی آیا فایل markdown است
    isMarkdownFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return ext === '.md' || ext === '.markdown';
    }

    // خواندن و تبدیل فایل markdown به HTML
    async processFile(filePath) {
        try {
            // خواندن محتوای فایل
            const markdownContent = await fsPromises.readFile(filePath, 'utf-8');

            // تبدیل markdown به HTML با رندر سفارشی
            const htmlContent = await this.renderWithLineIds(markdownContent);

            return {
                success: true,
                html: htmlContent,
                title: await this.getTitle(filePath, markdownContent),
                rawContent: markdownContent
            };
        } catch (error) {
            console.error(`Error processing markdown file: ${filePath}`, error);
            return {
                success: false,
                error: error.message,
                html: null,
                title: null,
                rawContent: null
            };
        }
    }

    // رندر markdown با اضافه کردن ID به هر خط
    async renderWithLineIds(markdownContent) {
        // استفاده از renderer سفارشی
        const renderer = new marked.Renderer();

        // ذخیره شماره خط اصلی
        let currentLine = 0;
        const lineMap = new Map(); // نگاشت خط HTML به خط markdown

        // پاراگراف
        const originalParagraph = renderer.paragraph.bind(renderer);
        renderer.paragraph = (text) => {
            currentLine++;
            const lineId = `line-${currentLine}`;
            lineMap.set(currentLine, currentLine);
            return `<p id="${lineId}" class="line-anchor-target">${text}</p>`;
        };

        // heading
        const originalHeading = renderer.heading.bind(renderer);
        renderer.heading = (text, level) => {
            currentLine++;
            const lineId = `line-${currentLine}`;
            const slug = text.toLowerCase().replace(/[^\w\u0600-\u06FF]+/g, '-');
            return `<h${level} id="${lineId}" class="line-anchor-target" data-slug="${slug}">${text}</h${level}>`;
        };

        // list item
        const originalListitem = renderer.listitem.bind(renderer);
        renderer.listitem = (text) => {
            currentLine++;
            const lineId = `line-${currentLine}`;
            return `<li id="${lineId}" class="line-anchor-target">${text}</li>`;
        };

        // code block
        const originalCode = renderer.code.bind(renderer);
        renderer.code = (code, language) => {
            currentLine++;
            const lineId = `line-${currentLine}`;
            return `<pre id="${lineId}" class="line-anchor-target"><code class="language-${language || ''}">${code}</code></pre>`;
        };

        // blockquote
        const originalBlockquote = renderer.blockquote.bind(renderer);
        renderer.blockquote = (quote) => {
            currentLine++;
            const lineId = `line-${currentLine}`;
            return `<blockquote id="${lineId}" class="line-anchor-target">${quote}</blockquote>`;
        };

        // table
        const originalTable = renderer.table.bind(renderer);
        renderer.table = (header, body) => {
            currentLine++;
            const lineId = `line-${currentLine}`;
            return `<table id="${lineId}" class="line-anchor-target">${header}${body}</table>`;
        };

        marked.setOptions({ renderer });

        const html = marked.parse(markdownContent);

        // بازگرداندن renderer پیش‌فرض
        marked.setOptions({ renderer: new marked.Renderer() });

        return html;
    }

    // استخراج عنوان از فایل markdown
    async getTitle(filePath, content = null) {
        try {
            if (!content) {
                content = await fsPromises.readFile(filePath, 'utf-8');
            }

            const firstLine = content.split('\n')[0];
            if (firstLine.startsWith('# ')) {
                return firstLine.substring(2).trim();
            }

            return path.basename(filePath, path.extname(filePath));
        } catch (error) {
            console.error(`Error getting title from: ${filePath}`, error);
            return path.basename(filePath, path.extname(filePath));
        }
    }

    // اعتبارسنجی فایل markdown
    async validateFile(filePath) {
        try {
            await fsPromises.access(filePath);
            return {
                exists: true,
                isMarkdown: this.isMarkdownFile(filePath)
            };
        } catch (error) {
            return {
                exists: false,
                isMarkdown: false
            };
        }
    }
}

module.exports = new MarkdownProcessor();