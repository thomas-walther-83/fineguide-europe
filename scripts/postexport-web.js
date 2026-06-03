// Post-processes the web export (dist/) for a PWA on GitHub Pages:
//  1. Injects PWA / iOS home-screen metadata into index.html.
//  2. Writes 404.html (SPA deep-link fallback for GitHub Pages).
//  3. Writes .nojekyll so the _expo/ folder is served as-is.
//
// Runs after `expo export --platform web`. See `npm run build:web`.
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const appJson = require('../app.json');

// Normalise the base path to have a single leading and trailing slash.
const rawBase = appJson.expo?.experiments?.baseUrl || '/';
const base = `/${rawBase}/`.replace(/\/+/g, '/');

const indexPath = path.join(dist, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Make the viewport notch-aware on iOS.
html = html.replace(
  /<meta name="viewport"[^>]*>/,
  '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />'
);

const tags = [
  `<meta name="description" content="Verkehrsbussen in europäischen Ländern" />`,
  `<link rel="manifest" href="${base}manifest.json" />`,
  `<meta name="theme-color" content="#0a7ea4" />`,
  `<link rel="icon" href="${base}favicon.png" />`,
  `<link rel="apple-touch-icon" href="${base}apple-touch-icon.png" />`,
  `<meta name="apple-mobile-web-app-capable" content="yes" />`,
  `<meta name="mobile-web-app-capable" content="yes" />`,
  `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`,
  `<meta name="apple-mobile-web-app-title" content="FineGuide" />`,
].join('\n    ');

if (!html.includes('rel="manifest"')) {
  html = html.replace('</head>', `    ${tags}\n  </head>`);
}

fs.writeFileSync(indexPath, html);
fs.copyFileSync(indexPath, path.join(dist, '404.html'));
fs.writeFileSync(path.join(dist, '.nojekyll'), '');

console.log(`postexport-web: injected PWA tags (base "${base}"), wrote 404.html + .nojekyll`);
