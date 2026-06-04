// Post-processes the web export (dist/) for a PWA on GitHub Pages:
//  1. Injects PWA / iOS home-screen metadata into index.html.
//  2. Injects @font-face rules for the bundled display + body fonts so the
//     "Premium Data" type renders on web (the TTFs live in public/fonts/ and
//     are copied verbatim into dist/fonts/ by the export).
//  3. Writes 404.html (SPA deep-link fallback for GitHub Pages).
//  4. Writes .nojekyll so the _expo/ folder is served as-is.
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

// @font-face rules — keep the family names in sync with lib/theme.ts `fonts`.
// font-display:swap shows a system fallback until the webfont arrives, so the
// app never blocks on the network and respects the splash-safe pattern.
const FONT_FACES = [
  ['Sora_600SemiBold', 'Sora_600SemiBold.ttf'],
  ['Sora_700Bold', 'Sora_700Bold.ttf'],
  ['Sora_800ExtraBold', 'Sora_800ExtraBold.ttf'],
  ['Inter_400Regular', 'Inter_400Regular.ttf'],
  ['Inter_500Medium', 'Inter_500Medium.ttf'],
  ['Inter_600SemiBold', 'Inter_600SemiBold.ttf'],
  ['Inter_700Bold', 'Inter_700Bold.ttf'],
];
const fontCss =
  '<style id="premium-fonts">\n' +
  FONT_FACES.map(
    ([family, file]) =>
      `      @font-face{font-family:'${family}';src:url('${base}fonts/${file}') format('truetype');font-display:swap;}`
  ).join('\n') +
  '\n    </style>';
if (!html.includes('id="premium-fonts"')) {
  html = html.replace('</head>', `    ${fontCss}\n  </head>`);
}

const tags = [
  `<meta name="description" content="Verkehrsbussen in europäischen Ländern" />`,
  `<link rel="manifest" href="${base}manifest.json" />`,
  `<meta name="theme-color" content="#0B1220" media="(prefers-color-scheme: dark)" />`,
  `<meta name="theme-color" content="#F4F6FA" media="(prefers-color-scheme: light)" />`,
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
