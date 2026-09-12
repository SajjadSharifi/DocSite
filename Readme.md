# DocSite

An awesome and easy way to build your project's documentation using **Markdown** and **Jupyter Notebook**.

## Project Look

**Light Mode**  

![Light Mode Screenshot](Readme_Images/screenshot-light.png)

**Dark Mode**  

![Dark Mode Screenshot](Readme_Images/screenshot-dark.png)

> **Note:** Place your screenshot images in `docs/images/` and update the paths above.

## Features

- Supports both Markdown (`.md`) and Jupyter Notebook (`.ipynb`) files
- Clean, responsive design for desktop, tablet, and mobile
- Dark and light theme toggle
- Full-text search across all documents
- RTL / LTR / Auto text direction
- Local image support
- Table of contents with scroll spy
- Syntax highlighting and copy button for code blocks

## Installation Guide

1. **Install Node.js**  
   Download and install from [https://nodejs.org](https://nodejs.org/en).

2. **Install dependencies**  
   In the project root folder (where `package.json` is located), run:
   ```bash
   npm install
   ```

3. **Start the server**  
   After installation completes, run:
   ```bash
   node server.js
   ```

4. **Open in browser**  
   You should see:
   ```
   Documentation server running at http://localhost:3000
   ```
   Copy `http://localhost:3000` and paste it into your browser. You'll see the Quick Guide right away. Enjoy!

## Adding Your Own Documents

- Place your `.md` or `.ipynb` files inside the `docs` folder.
- You can organize them in subfolders, they'll appear as collapsible sections in the sidebar.
- The first file will be your home page.

## Quick Guide

A full **Quick Guide** is included in the docs folder. It covers:
- How to add images
- Tips for writing documentation

---
## Customization

you can customize the site by editing `server.js`. Look for the `CONFIG` object at the top:

```javascript
const CONFIG = {
    author: 'Your Name',
    siteName: 'Documentation',
    footerText: 'Built with'
};

const PORT = 3000;
```
### Change the Port

Change `PORT` if port 3000 is already in use:

```javascript
const PORT = 8080;
```

Then open `http://localhost:8080` instead.

### Change the Site Title
The site title comes from the first heading (`# Title`) of each Markdown file, so just edit your `.md` files.

### Change Colors and Theme
All colors are defined as **CSS variables** inside the `_variables.scss` file, located in the `scss/` directory. Open it and look for the `:root` section:

```scss
// scss/_variables.scss
:root {
    --accent-color: #4a90e2;   // Main accent color
    --content-bg: #ffffff;      // Background color
    --text-color: #333;         // Text color
    // ... other variables
}
```

Change these values to customize the appearance. The dark theme uses the same variables under the `[data-theme="dark"]` selector in the same file:

```scss
// scss/_variables.scss
[data-theme="dark"] {
    --accent-color: #6cb2eb;
    --content-bg: #1a1a1a;
    --text-color: #e1e1e6;
    // ... other dark theme variables
}
```

#### After Making Changes
Since the project uses SCSS, you need to recompile the styles and then move the files that created to `static/css` folder in order to take effect. Run the following command from the project `root/static/Scss`:

```bash
sass style.scss style.css --style=compressed
```
#### File Structure
If you want to make more advanced changes, here is how the SCSS files are organized:

```
scss/
├── style.scss              // Main entry point
├── _variables.scss        // Colors, breakpoints, mixins  ← START HERE
├── _base.scss              // Global resets and body styles
├── _nav.scss               // Top navigation and search modal
├── _layout.scss            // Sidebar, TOC, footer
├── _content.scss           // Document content, code blocks, tables
├── _direction-toggle.scss  // RTL/LTR direction switcher
└── _responsive.scss        // Mobile and tablet overrides
```

> **💡 Tip:** Because the SCSS files are modular, you only need to edit `_variables.scss` for most color/theme changes. The changes will automatically propagate to all other files via the `var(--...)` references.