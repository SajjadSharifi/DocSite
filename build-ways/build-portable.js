const fs = require('fs');
const path = require('path');

console.log('Creating fully portable folder...\n');

const outputDir = 'DocsSite-Portable';
const nodeFolderName = 'node-v24.20.0-win-x64'; // نام پوشه Node.js portable

// پاک کردن پوشه قبلی
if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
}

fs.mkdirSync(outputDir, { recursive: true });

// تابع کپی پوشه
function copyFolder(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyFolder(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// کپی فایل‌های پروژه
console.log('Step 1: Copying project files...');
copyFolder('static', path.join(outputDir, 'static'));
copyFolder('processors', path.join(outputDir, 'processors'));
copyFolder('utils', path.join(outputDir, 'utils'));

// کپی node_modules
console.log('Step 2: Copying node_modules...');
if (!fs.existsSync(path.join(outputDir, 'node_modules'))) {
    fs.mkdirSync(path.join(outputDir, 'node_modules'));
}

const modulesToCopy = ['express', 'marked', 'highlight.js'];
for (const mod of modulesToCopy) {
    const srcPath = path.join('node_modules', mod);
    const destPath = path.join(outputDir, 'node_modules', mod);

    if (fs.existsSync(srcPath)) {
        copyFolder(srcPath, destPath);
        console.log(`  ✓ ${mod}`);
    }
}

// کپی server.js
console.log('Step 3: Copying server.js...');
fs.copyFileSync('server.js', path.join(outputDir, 'server.js'));

// ساخت package.json
console.log('Step 4: Creating package.json...');
const packageJson = {
    name: "docs-site-portable",
    version: "1.0.0",
    main: "server.js",
    dependencies: {
        "express": "^4.18.2",
        "marked": "^9.1.6",
        "highlight.js": "^11.9.0"
    }
};

fs.writeFileSync(
    path.join(outputDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
);

// ساخت پوشه docs
console.log('Step 5: Creating docs folder...');
if (!fs.existsSync(path.join(outputDir, 'docs'))) {
    fs.mkdirSync(path.join(outputDir, 'docs'));
    fs.writeFileSync(
        path.join(outputDir, 'docs', 'index.md'),
        '# Welcome to Documentation\n\nAdd your Markdown files here.\n'
    );
}

// کپی Node.js portable
console.log('Step 6: Copying Node.js portable...');
const nodeSourcePath = path.join(__dirname, nodeFolderName);
const nodeDestPath = path.join(outputDir, nodeFolderName);

if (!fs.existsSync(nodeSourcePath)) {
    console.error(`\n❌ Error: Node.js folder not found!`);
    console.error(`Expected folder: ${nodeSourcePath}`);
    console.error(`\nPlease make sure "${nodeFolderName}" is in the project root.`);
    process.exit(1);
}

copyFolder(nodeSourcePath, nodeDestPath);
console.log(`  ✓ ${nodeFolderName}`);

// پیدا کردن مسیر node.exe
const nodeExePath = path.join(outputDir, nodeFolderName, 'node.exe');
if (!fs.existsSync(nodeExePath)) {
    console.error('\n❌ Error: node.exe not found in portable folder!');
    process.exit(1);
}

console.log(`  ✓ node.exe found at: ${nodeExePath}`);

// ساخت فایل bat
console.log('Step 7: Creating Start-Docs.bat...');
const batContent = `@echo off
title Documentation Server
echo ================================
echo   Documentation Server
echo ================================
echo.
echo Server will start at: http://localhost:3000
echo Press Ctrl+C to stop
echo.
"%~dp0${nodeFolderName}\\node.exe" "%~dp0server.js"
pause
`;

fs.writeFileSync(path.join(outputDir, 'Start-Docs.bat'), batContent);

// ساخت فایل README
console.log('Step 8: Creating README...');
const readmeContent = `# Documentation Server (Portable)

## ✅ Fully Portable - No Installation Needed!

This folder includes:
- Node.js portable (${nodeFolderName})
- All dependencies
- Static files
- Server code

## How to Use

1. Double-click \`Start-Docs.bat\`
2. Open http://localhost:3000 in browser
3. Add your Markdown files to \`docs\` folder

## Folder Structure

\`\`\`
${outputDir}/
├── Start-Docs.bat
├── server.js
├── package.json
├── ${nodeFolderName}/
│   └── node.exe
├── static/
├── processors/
├── utils/
├── node_modules/
└── docs/
    └── index.md
\`\`\`

## Notes

- No Node.js installation required
- Runs only on localhost
- All files are read-only
`;

fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent);

// نمایش خلاصه
console.log('\n✅ Fully portable folder created successfully!');
console.log(`\n📁 Output: ${outputDir}/`);
console.log('\n📦 Contents:');
console.log('   ✓ Node.js portable (no installation needed)');
console.log('   ✓ Server code');
console.log('   ✓ All dependencies');
console.log('   ✓ Static files');
console.log('   ✓ docs folder');
console.log('   ✓ Start-Docs.bat');
console.log('\n📝 To use:');
console.log('1. Copy the entire folder anywhere');
console.log('2. Double-click Start-Docs.bat');
console.log('3. Open http://localhost:3000');
console.log('\n✅ No Node.js installation required on target computer!');