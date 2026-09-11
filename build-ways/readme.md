# Build Guide

Two ways to build DocSite. Pick the one that fits your needs.

> **Note:** Move these scripts to the project root (next to `package.json` and `server.js`) before running them.

---

## Method 1: `build-portable.js`, No Node.js needed on target PC

Creates a fully portable folder that runs on any Windows machine without requiring Node.js to be installed. **Works offline.**

### Setup

1. Download the **portable** Node.js for Windows from [nodejs.org](https://nodejs.org/en/download) (choose the `.zip` version, not the installer).
2. Extract it to the project root and rename the folder to `node-v24.20.0-win-x64` (or update `nodeFolderName` in the script to match your folder name).

### Run

```bash
node build-portable.js
```

### Result

A `DocsSite-Portable/` folder. Copy it anywhere, double-click `Start-Docs.bat`, and open `http://localhost:3000` in your browser.

**Best for:** Sharing with non-technical users.

---

## Method 2: `build.js` — Lightweight bundle

Bundles the project with `esbuild`. Requires Node.js on the target machine.

### Setup

```bash
npm install --save-dev esbuild
```

### Run

```bash
node build.js
```

### Result

A `dist/` folder. Run it with:

```bash
cd dist
node server.js
```

**Best for:** Developers and users who already have Node.js.

---

## Quick Comparison

| Feature | Portable | Bundle |
|---------|----------|--------|
| Needs Node.js on target PC | No | Yes |
| Needs internet during build | No | First time only |
| Output size | Larger | Smaller |
| Best for | End users | Developers |
