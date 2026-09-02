const express = require('express');
const fsPromises = require('fs').promises;
const path = require('path');
const markdownProcessor = require('./processors/markdownProcessor');
const jupyterProcessor = require('./processors/jupyterProcessor');
const fileStructureManager = require('./utils/fileStructure');
const searchEngine = require('./utils/searchEngine');

const app = express();
const PORT = 3000;

const CONFIG = {
    author: 'Sajjad Sharifi Panah',
    siteName: 'Easy_Project_Documentation',
    footerText: 'Made By'
};

// Middleware
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

// سرو تصاویر از پوشه docs
app.use('/docs/images', express.static(path.join(__dirname, 'docs', 'images')));

// Function to read and process template
async function processTemplate(templatePath, variables) {
    let template = await fsPromises.readFile(templatePath, 'utf-8');

    Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{%${key}%}`, 'g');
        template = template.replace(regex, variables[key]);
    });

    return template;
}

// Function to build navigation HTML
function buildNavigation(structure, currentPath = '') {
    let html = '<ul class="nav-list">';

    for (const item of structure) {
        if (item.type === 'directory') {
            const isExpanded = currentPath.startsWith(item.path);
            html += `
                <li class="nav-item nav-folder ${isExpanded ? 'open' : ''}">
                    <div class="nav-folder-header" onclick="toggleFolder(this)">
                        <span class="folder-icon">📁</span>
                        <span>${item.name}</span>
                        <span class="chevron">${isExpanded ? '▼' : '▶'}</span>
                    </div>
                    <div class="nav-folder-content" style="${isExpanded ? 'display: block;' : 'display: none;'}">
                        ${buildNavigation(item.children || [], currentPath)}
                    </div>
                </li>`;
        } else {
            const isActive = item.path === currentPath;
            const displayName = item.name.replace(/\.(md|markdown|ipynb)$/, '');
            const icon = item.fileType === 'jupyter' ? '📓' : '📄';
            html += `
                <li class="nav-item nav-file ${isActive ? 'active' : ''}">
                    <a href="/docs/${item.path}" class="nav-link">
                        <span class="file-icon">${icon}</span>
                        <span>${displayName}</span>
                    </a>
                </li>`;
        }
    }

    html += '</ul>';
    return html;
}

// Redirect root to first available document
app.get('/', async (req, res) => {
    try {
        const docsPath = path.join(__dirname, 'docs');

        const docsCheck = await fileStructureManager.checkDocsDirectory(docsPath);
        if (!docsCheck.exists) {
            return res.status(404).send('No docs folder found. Please create a "docs" folder.');
        }

        const structure = await fileStructureManager.getFileStructure(docsPath);
        const firstDoc = fileStructureManager.findFirstDocument(structure);

        if (firstDoc) {
            res.redirect(`/docs/${firstDoc.path}`);
        } else {
            res.status(404).send('No documentation files found. Please add markdown or Jupyter notebook files to the docs folder.');
        }
    } catch (error) {
        console.error('Error redirecting to first document:', error);
        res.status(500).send('Internal server error');
    }
});

// Handle /docs/ without specific file
app.get('/docs/', async (req, res) => {
    try {
        const docsPath = path.join(__dirname, 'docs');

        const docsCheck = await fileStructureManager.checkDocsDirectory(docsPath);
        if (!docsCheck.exists) {
            return res.status(404).send('No docs folder found.');
        }

        const structure = await fileStructureManager.getFileStructure(docsPath);
        const firstDoc = fileStructureManager.findFirstDocument(structure);

        if (firstDoc) {
            res.redirect(`/docs/${firstDoc.path}`);
        } else {
            res.status(404).send('No documentation files found.');
        }
    } catch (error) {
        console.error('Error handling /docs/ route:', error);
        res.status(500).send('Internal server error');
    }
});


// Main route to serve documentation
app.get('/docs/*', async (req, res) => {
    try {
        const requestedPath = req.params[0];
        const fullPath = path.join(__dirname, 'docs', requestedPath);

        // Security check to prevent directory traversal
        if (!fullPath.startsWith(path.join(__dirname, 'docs'))) {
            return res.status(403).send('Access denied');
        }

        // اگر فایل تصویر است، مستقیماً سرو کن
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico'];
        const fileExt = path.extname(fullPath).toLowerCase();

        if (imageExtensions.includes(fileExt)) {
            try {
                await fsPromises.access(fullPath);
                return res.sendFile(fullPath);
            } catch (error) {
                return res.status(404).send('Image not found');
            }
        }

        // بررسی وجود فایل
        try {
            await fsPromises.access(fullPath);
        } catch (error) {
            return res.status(404).send('Document not found');
        }

        // اگر فایل markdown یا jupyter نیست، سرو کن
        const isMarkdown = markdownProcessor.isMarkdownFile(fullPath);
        const isJupyter = jupyterProcessor.isJupyterFile(fullPath);

        if (!isMarkdown && !isJupyter) {
            return res.sendFile(fullPath);
        }

        // پردازش مستندات
        const processor = isMarkdown ? markdownProcessor : jupyterProcessor;
        const processedDoc = await processor.processFile(fullPath);

        if (!processedDoc.success) {
            return res.status(500).send(`Error processing document: ${processedDoc.error}`);
        }

        // Get file structure for navigation
        const structure = await fileStructureManager.getFileStructure(path.join(__dirname, 'docs'));
        const navigation = buildNavigation(structure, requestedPath);

        // Process template
        const variables = {
            Title: processedDoc.title,
            Content: processedDoc.html,
            Navigation: navigation,
            Year: new Date().getFullYear().toString(),
            CurrentPath: requestedPath,
            Author: CONFIG.author,
            FooterText: CONFIG.footerText
        };

        const templatePath = path.join(__dirname, 'static', 'template.html');
        const renderedHtml = await processTemplate(templatePath, variables);

        res.send(renderedHtml);
    } catch (error) {
        console.error('Error serving documentation:', error);
        res.status(500).send('Internal server error');
    }
});

// API endpoint to get file structure
app.get('/api/structure', async (req, res) => {
    try {
        const structure = await fileStructureManager.getFileStructure(path.join(__dirname, 'docs'));
        res.json(structure);
    } catch (error) {
        console.error('Error getting file structure:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to get raw file content
app.get('/api/raw/:path(*)', async (req, res) => {
    try {
        const requestedPath = req.params.path;
        const fullPath = path.join(__dirname, 'docs', requestedPath);

        if (!fullPath.startsWith(path.join(__dirname, 'docs'))) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const content = await fsPromises.readFile(fullPath, 'utf-8');
        res.json({ content });
    } catch (error) {
        console.error('Error reading raw file:', error);
        res.status(404).json({ error: 'File not found' });
    }
});

// API endpoint for search
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const docsPath = path.join(__dirname, 'docs');

        const results = await searchEngine.search(query, docsPath);

        res.json({
            success: true,
            query: query,
            results: results,
            count: results.length
        });
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start server
app.listen(PORT, () => {
    console.log(`Documentation server running at http://localhost:${PORT}`);
    console.log(`Docs folder: ${path.join(__dirname, 'docs')}`);
    console.log(`Press Ctrl+C to stop the server`);
});