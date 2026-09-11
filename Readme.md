# DocSite

A self-hosted documentation site for Markdown and Jupyter Notebook files with full-text search, dark mode, and RTL support.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Search](#search)
- [Themes](#themes)
- [Contributing](#contributing)
- [License](#license)

## Features

- Markdown file support with GitHub Flavored Markdown
- Jupyter Notebook (.ipynb) rendering
- Full-text search across all documents
- Dark and light theme toggle
- Right-to-left (RTL) support for Persian and Arabic
- Local image serving from `docs` folder
- Responsive design for mobile, tablet, and desktop
- Table of contents with scroll spy
- Syntax highlighting for code blocks
- Copy button for code blocks
- Keyboard shortcuts

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/DocSite.git
cd DocSite

# Install dependencies
npm install

# Start the server
npm start


The server will start at `http://localhost:3000`.

## Quick Start

1. Create a `docs` folder in the project root
2. Add your Markdown files to the `docs` folder
3. Open `http://localhost:3000` in your browser

Example:

```bash
mkdir docs
echo "# Hello World" > docs/index.md
npm start
```

## Configuration

Edit `server.js` to customize:

```javascript
const CONFIG = {
    author: 'Your Name',
    siteName: 'Documentation',
    footerText: 'Created with'
};

const PORT = 3000;
```

## Usage Guide

### Markdown Files

Supported extensions: `.md`, `.markdown`

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
`inline code`

- List item 1
- List item 2

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |

```python
def hello():
    print("Hello, World!")
```
```

### Jupyter Notebooks

Supported extension: `.ipynb`

- Markdown cells render as HTML
- Code cells display with syntax highlighting
- Outputs (text, images, errors) are displayed
- Execution count is shown

### Images

Place images in the `docs/images` folder:
```

docs/
├── images/
│   └── example.png
└── index.md
```
Reference them with relative paths:

```markdown
![Example](images/example.png)
```

The `images` folder is hidden from navigation.
### Folder Structure

```
project/
├── server.js
├── package.json
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   └── modules/
│   └── template.html
├── processors/
│   ├── markdownProcessor.js
│   └── jupyterProcessor.js
├── utils/
│   ├── fileStructure.js
│   └── searchEngine.js
└── docs/
    ├── index.md
    ├── images/
    └── guide.md
```

## Search

- Click the search button or press `Ctrl+K`
- Search across all document content
- Results show preview and file location
- Click result to navigate to exact line

## Themes

- Toggle dark/light mode with the theme button
- Preference saved in localStorage
- Automatic theme detection

## Responsive Design

- Desktop: Full sidebar and table of contents
- Tablet (961px - 1230px): Collapsible sidebar
- Mobile (< 960px): Hamburger menu, floating TOC button

## API Endpoints

### Get File Structure

```
GET /api/structure
```

Returns the documentation folder structure.

### Search

```
GET /api/search?q=query
```

Search all documents. Returns results with preview.

### Raw File

```
GET /api/raw/:path
```

Get raw content of a file.

## Building Executable

### Portable Folder

```bash
node build-portable.js
```

Creates a portable folder with Node.js included.

### Standalone Executable

```bash
# Install pkg
npm install @yao-pkg/pkg

# Build exe
node build-portable.js
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open search |
| `Escape` | Close modals |

## Hidden Folders

These folders are not shown in navigation:

- `images`
- `assets`
- `img`
- `static`
- `node_modules`

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
## Acknowledgments

- Express.js
- Marked
- highlight.js
- MathJax
