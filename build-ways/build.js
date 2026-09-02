const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

console.log('Building DocsSite.exe...');

// ساخت پوشه dist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// کپی فایل‌های static به dist
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

// کپی static
console.log('Copying static files...');
copyFolder('static', 'dist/static');

// باندل کردن server.js
console.log('Bundling server.js...');
esbuild.build({
    entryPoints: ['server.js'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'dist/server.js',
    external: ['express', 'marked', 'highlight.js'], // این‌ها در node_modules می‌مانند
    minify: false,
    sourcemap: false,
}).then(() => {
    console.log('Bundling completed!');

    // کپی node_modules ضروری
    console.log('Copying node_modules...');
    const modulesToCopy = ['express', 'marked', 'highlight.js'];

    if (!fs.existsSync('dist/node_modules')) {
        fs.mkdirSync('dist/node_modules');
    }

    for (const mod of modulesToCopy) {
        const srcPath = path.join('node_modules', mod);
        const destPath = path.join('dist/node_modules', mod);

        if (fs.existsSync(srcPath)) {
            copyFolder(srcPath, destPath);
            console.log(`  Copied: ${mod}`);
        }
    }

    // کپی package.json
    const packageJson = {
        name: "docs-site",
        version: "1.0.0",
        main: "server.js",
        dependencies: {
            "express": "^4.18.2",
            "marked": "^9.1.6",
            "highlight.js": "^11.9.0"
        }
    };

    fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

    console.log('\nBuild completed successfully!');
    console.log('Output folder: dist/');
    console.log('\nTo create exe, use one of these tools:');
    console.log('1. node --experimental-sea-config (Node.js SEA)');
    console.log('2. nexe (npm install -g nexe)');
    console.log('3. Or just run: node dist/server.js');
}).catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
});