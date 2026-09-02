const fsPromises = require('fs').promises;
const path = require('path');

class FileStructureManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5000;
        this.ignoredFolders = ['images', 'assets', 'img', 'static', 'node_modules', '.git'];
        this.ignoredFiles = ['.DS_Store', 'Thumbs.db'];
    }

    async getFileStructure(dirPath, basePath = '') {
        const cacheKey = dirPath;

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        const structure = await this.buildStructure(dirPath, basePath);

        this.cache.set(cacheKey, {
            timestamp: Date.now(),
            data: structure
        });

        return structure;
    }

    async buildStructure(dirPath, basePath = '') {
        const structure = [];

        try {
            const items = await fsPromises.readdir(dirPath);

            const itemsWithStats = await Promise.all(
                items
                    .filter(item => !this.shouldIgnore(item))
                    .map(async (item) => {
                        const fullPath = path.join(dirPath, item);
                        const stat = await fsPromises.stat(fullPath);
                        return { item, fullPath, stat };
                    })
            );

            itemsWithStats.sort((a, b) => {
                if (a.stat.isDirectory() && !b.stat.isDirectory()) return -1;
                if (!a.stat.isDirectory() && b.stat.isDirectory()) return 1;
                return a.item.localeCompare(b.item);
            });

            for (const { item, fullPath, stat } of itemsWithStats) {
                const relativePath = path.join(basePath, item);

                if (stat.isDirectory()) {
                    if (!this.ignoredFolders.includes(item.toLowerCase())) {
                        const children = await this.buildStructure(fullPath, relativePath);

                        if (children.length > 0) {
                            structure.push({
                                name: item,
                                type: 'directory',
                                path: relativePath,
                                children: children
                            });
                        }
                    }
                } else if (this.isDocumentationFile(item)) {
                    structure.push({
                        name: item,
                        type: 'file',
                        path: relativePath,
                        fileType: this.getFileType(item)
                    });
                }
            }
        } catch (error) {
            console.error(`Error reading directory: ${dirPath}`, error);
        }

        return structure;
    }

    shouldIgnore(itemName) {
        return this.ignoredFiles.includes(itemName);
    }

    isDocumentationFile(filename) {
        const docExtensions = ['.md', '.markdown', '.ipynb'];
        return docExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    }

    getFileType(filename) {
        const ext = path.extname(filename).toLowerCase();
        switch (ext) {
            case '.md':
            case '.markdown':
                return 'markdown';
            case '.ipynb':
                return 'jupyter';
            default:
                return 'unknown';
        }
    }

    findFirstDocument(structure) {
        for (const item of structure) {
            if (item.type === 'file') {
                return item;
            } else if (item.type === 'directory' && item.children) {
                const found = this.findFirstDocument(item.children);
                if (found) return found;
            }
        }
        return null;
    }

    async checkDocsDirectory(docsPath) {
        try {
            await fsPromises.access(docsPath);
            return { exists: true };
        } catch (error) {
            try {
                await fsPromises.mkdir(docsPath, { recursive: true });
                const sampleFile = path.join(docsPath, 'index.md');
                await fsPromises.writeFile(sampleFile, '# Welcome to Documentation\n\nThis is your documentation site. Add your Markdown files to this folder.\n');
                return { exists: true, created: true };
            } catch (mkdirError) {
                console.error('Error creating docs folder:', mkdirError);
                return { exists: false };
            }
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

module.exports = new FileStructureManager();