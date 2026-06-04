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

// Root sizing + page background.
//
// On an installed iOS PWA (`viewport-fit=cover` + translucent status bar) the
// CSS `%` height chain under-resolves, so the whole react-native-web flex tree
// lays out shorter than the screen — leaving canvas-coloured slack above and
// below the tab bar and clipping content early. Anchoring html/body/#root to
// the *dynamic* viewport (`100dvh`, with `100%` as the pre-dvh fallback)
// resolves to the true visible height, so the flex chain fills the screen and
// the tab bar sits flush at the bottom.
//
// The background colours (light + dark) also fill any area momentarily not
// covered by the app, so it matches the app canvas instead of flashing white.
const appBgCss =
  '<style id="app-bg">' +
  'html,body,#root{height:100%;height:100dvh;margin:0;}' +
  'html,body{background-color:#E7ECF3;}' +
  '#root{display:flex;flex-direction:column;}' +
  '@media (prefers-color-scheme:dark){html,body{background-color:#151D2C;}}' +
  '</style>';
if (!html.includes('id="app-bg"')) {
  html = html.replace('</head>', `    ${appBgCss}\n  </head>`);
}

const tags = [
  `<meta name="description" content="Verkehrsbussen in europäischen Ländern" />`,
  `<link rel="manifest" href="${base}manifest.json" />`,
  `<meta name="theme-color" content="#151D2C" media="(prefers-color-scheme: dark)" />`,
  `<meta name="theme-color" content="#E7ECF3" media="(prefers-color-scheme: light)" />`,
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

// Register the app-shell service worker (web only, feature-guarded). `public/`
// is copied verbatim into `dist/` by the export, so `${base}sw.js` resolves to
// the SW under the GitHub Pages base path.
const swScript = [
  `<script>`,
  `  if ('serviceWorker' in navigator) {`,
  `    window.addEventListener('load', function () {`,
  `      navigator.serviceWorker.register('${base}sw.js').catch(function (err) {`,
  `        console.warn('[sw] registration failed:', err);`,
  `      });`,
  `    });`,
  `  }`,
  `</script>`,
].join('\n    ');

if (!html.includes("serviceWorker.register")) {
  html = html.replace('</body>', `    ${swScript}\n  </body>`);
}

fs.writeFileSync(indexPath, html);
fs.copyFileSync(indexPath, path.join(dist, '404.html'));
fs.writeFileSync(path.join(dist, '.nojekyll'), '');

console.log(
  `postexport-web: injected PWA tags + SW registration (base "${base}"), wrote 404.html + .nojekyll`
);
