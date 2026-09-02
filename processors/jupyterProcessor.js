const fsPromises = require('fs').promises;
const path = require('path');
const marked = require('marked');
const hljs = require('highlight.js');

class JupyterProcessor {
    constructor() {
        this.supportedExtensions = ['.ipynb'];

        // تنظیمات marked برای markdown cells
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

    // بررسی آیا فایل Jupyter است
    isJupyterFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return this.supportedExtensions.includes(ext);
    }

    // خواندن و پردازش فایل Jupyter Notebook
    async processFile(filePath) {
        try {
            // خواندن فایل JSON
            const notebookContent = await fsPromises.readFile(filePath, 'utf-8');
            const notebook = JSON.parse(notebookContent);

            // تبدیل به HTML
            const htmlContent = this.convertToHtml(notebook);

            return {
                success: true,
                html: htmlContent,
                title: this.getTitle(notebook, filePath),
                rawContent: notebookContent,
                notebookData: notebook
            };
        } catch (error) {
            console.error(`Error processing Jupyter notebook: ${filePath}`, error);
            return {
                success: false,
                error: error.message,
                html: null,
                title: null,
                rawContent: null,
                notebookData: null
            };
        }
    }

    // تبدیل Notebook به HTML
    convertToHtml(notebook) {
        let html = '<div class="jupyter-notebook">';

        // اضافه کردن متادیتا
        if (notebook.metadata && notebook.metadata.title) {
            html += `<div class="notebook-title">${this.escapeHtml(notebook.metadata.title)}</div>`;
        }

        // پردازش سلول‌ها
        if (notebook.cells && Array.isArray(notebook.cells)) {
            for (let i = 0; i < notebook.cells.length; i++) {
                const cell = notebook.cells[i];
                html += this.processCell(cell, i);
            }
        }

        html += '</div>';
        return html;
    }

    // پردازش هر سلول
    processCell(cell, index) {
        const cellType = cell.cell_type;

        switch (cellType) {
            case 'markdown':
                return this.processMarkdownCell(cell, index);
            case 'code':
                return this.processCodeCell(cell, index);
            case 'raw':
                return this.processRawCell(cell, index);
            default:
                return '';
        }
    }

    // پردازش سلول Markdown
    processMarkdownCell(cell, index) {
        const source = this.getSource(cell);
        const html = marked.parse(source);

        return `
            <div class="cell markdown-cell" id="cell-${index}">
                <div class="cell-content line-anchor-target" id="line-${index + 1}">
                    ${html}
                </div>
            </div>`;
    }

    // پردازش سلول کد
    processCodeCell(cell, index) {
        const source = this.getSource(cell);
        const executionCount = cell.execution_count || '';
        const outputs = cell.outputs || [];

        let outputsHtml = '';

        if (outputs.length > 0) {
            outputsHtml = '<div class="cell-outputs">';

            for (const output of outputs) {
                outputsHtml += this.processOutput(output);
            }

            outputsHtml += '</div>';
        }

        // تشخیص زبان برنامه‌نویسی
        const language = this.detectLanguage(cell);

        return `
            <div class="cell code-cell" id="cell-${index}">
                <div class="cell-input line-anchor-target" id="line-${index + 1}">
                    <pre><code class="language-${language}">${this.escapeHtml(source)}</code></pre>
                </div>
                ${outputsHtml}
            </div>`;
    }

    // پردازش سلول Raw
    processRawCell(cell, index) {
        const source = this.getSource(cell);
        return `
            <div class="cell raw-cell" id="cell-${index}">
                <div class="line-anchor-target" id="line-${index + 1}">
                    <pre>${this.escapeHtml(source)}</pre>
                </div>
            </div>`;
    }

    // پردازش خروجی‌های سلول
    processOutput(output) {
        const outputType = output.output_type;

        switch (outputType) {
            case 'stream':
                return this.processStreamOutput(output);
            case 'display_data':
                return this.processDisplayData(output);
            case 'execute_result':
                return this.processExecuteResult(output);
            case 'error':
                return this.processErrorOutput(output);
            default:
                return '';
        }
    }

    // پردازش خروجی متنی
    processStreamOutput(output) {
        const text = this.getSource(output);

        return `
            <div class="output stream-output">
                <pre>${this.escapeHtml(text)}</pre>
            </div>`;
    }

    // پردازش خروجی نمایشی
    processDisplayData(output) {
        const data = output.data || {};
        let html = '<div class="output display-output">';

        // متن ساده
        if (data['text/plain']) {
            const text = this.getSource(data['text/plain']);
            html += `<pre>${this.escapeHtml(text)}</pre>`;
        }

        // HTML
        if (data['text/html']) {
            const htmlContent = this.getSource(data['text/html']);
            html += `<div class="output-html">${htmlContent}</div>`;
        }

        // تصویر PNG
        if (data['image/png']) {
            const imageData = this.getSource(data['image/png']);
            html += `<img src="data:image/png;base64,${imageData}" alt="Output Image" class="output-image">`;
        }

        // تصویر JPEG
        if (data['image/jpeg']) {
            const imageData = this.getSource(data['image/jpeg']);
            html += `<img src="data:image/jpeg;base64,${imageData}" alt="Output Image" class="output-image">`;
        }

        // SVG
        if (data['image/svg+xml']) {
            const svgContent = this.getSource(data['image/svg+xml']);
            html += `<div class="output-svg">${svgContent}</div>`;
        }

        // LaTeX
        if (data['text/latex']) {
            const latexContent = this.getSource(data['text/latex']);
            html += `<div class="output-latex">$${this.escapeHtml(latexContent)}$</div>`;
        }

        // Markdown
        if (data['text/markdown']) {
            const markdownContent = this.getSource(data['text/markdown']);
            html += `<div class="output-markdown">${marked.parse(markdownContent)}</div>`;
        }

        html += '</div>';
        return html;
    }

    // پردازش execute_result
    processExecuteResult(output) {
        let html = '<div class="output execute-result">';

        const data = output.data || {};

        // متن ساده
        if (data['text/plain']) {
            const text = this.getSource(data['text/plain']);
            html += `<pre>${this.escapeHtml(text)}</pre>`;
        }

        // HTML
        if (data['text/html']) {
            const htmlContent = this.getSource(data['text/html']);
            html += `<div class="output-html">${htmlContent}</div>`;
        }

        // تصویر
        if (data['image/png']) {
            const imageData = this.getSource(data['image/png']);
            html += `<img src="data:image/png;base64,${imageData}" alt="Output Image" class="output-image">`;
        }

        html += '</div>';
        return html;
    }

    // پردازش خطاها
    processErrorOutput(output) {
        const ename = output.ename || 'Error';
        const evalue = output.evalue || '';
        const traceback = this.getSource(output.traceback);

        return `
            <div class="output error-output">
                <div class="error-header">
                    <span class="error-name">${this.escapeHtml(ename)}</span>: ${this.escapeHtml(evalue)}
                </div>
                <pre class="error-traceback">${this.escapeHtml(traceback)}</pre>
            </div>`;
    }

    // دریافت عنوان Notebook
    getTitle(notebook, filePath) {
        // اول از متادیتا
        if (notebook.metadata && notebook.metadata.title) {
            return notebook.metadata.title;
        }

        // بعد از اولین سلول markdown
        if (notebook.cells) {
            const firstMarkdownCell = notebook.cells.find(cell => cell.cell_type === 'markdown');
            if (firstMarkdownCell) {
                const source = this.getSource(firstMarkdownCell);
                const firstLine = source.split('\n')[0];
                if (firstLine.startsWith('# ')) {
                    return firstLine.substring(2).trim();
                }
            }
        }

        // در نهایت از نام فایل
        return path.basename(filePath, '.ipynb');
    }

    // دریافت source از سلول یا خروجی
    getSource(obj) {
        if (!obj || obj.source === undefined) {
            return '';
        }

        if (Array.isArray(obj.source)) {
            return obj.source.join('');
        }

        if (Array.isArray(obj)) {
            return obj.join('');
        }

        return String(obj.source || '');
    }

    // تشخیص زبان برنامه‌نویسی
    detectLanguage(cell) {
        if (cell.metadata && cell.metadata.language) {
            return cell.metadata.language;
        }

        // تشخیص بر اساس کدنویسی
        const source = this.getSource(cell).toLowerCase();

        if (source.includes('def ') || source.includes('import ') || source.includes('print(')) {
            return 'python';
        }

        if (source.includes('function ') || source.includes('console.log') || source.includes('const ')) {
            return 'javascript';
        }

        if (source.includes('ggplot') || source.includes('library(')) {
            return 'r';
        }

        return 'python'; // پیش‌فرض
    }

    // اعتبارسنجی فایل
    async validateFile(filePath) {
        try {
            await fsPromises.access(filePath);
            return {
                exists: true,
                isJupyter: this.isJupyterFile(filePath)
            };
        } catch (error) {
            return {
                exists: false,
                isJupyter: false
            };
        }
    }

    // escape کردن HTML
    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// خروجی singleton
module.exports = new JupyterProcessor();