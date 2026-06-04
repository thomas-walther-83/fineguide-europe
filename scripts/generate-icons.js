// Generates the PWA / home-screen icons for FineGuide Europe.
// No external image tooling required — encodes PNGs directly (RGBA).
// Run with: node scripts/generate-icons.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Brand palette — aligned with lib/theme.ts brand.primary (#1B5FCC).
const BRAND_TOP = [43, 111, 224]; // lighter top of the gradient
const BRAND_BOTTOM = [23, 72, 160]; // deeper bottom (primaryPressed-ish)
const WHITE = [255, 255, 255];

// 5x7 pixel glyphs for the letters we need.
const GLYPHS = {
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
};

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function setPixel(buf, size, x, y, [r, g, b], a = 255) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const i = (y * size + x) * 4;
  buf[i] = r;
  buf[i + 1] = g;
  buf[i + 2] = b;
  buf[i + 3] = a;
}

function drawGlyph(buf, size, glyph, originX, originY, scale, color) {
  glyph.forEach((row, gy) => {
    [...row].forEach((cell, gx) => {
      if (cell !== '1') return;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          setPixel(buf, size, originX + gx * scale + dx, originY + gy * scale + dy, color);
        }
      }
    });
  });
}

function renderIcon(size) {
  const buf = Buffer.alloc(size * size * 4); // RGBA
  // Rounded-rect mask so the icon reads as a modern app badge.
  const r = Math.round(size * 0.22); // corner radius
  const min = 0;
  const max = size - 1;

  const inRoundedRect = (x, y) => {
    const inLeft = x < min + r;
    const inRight = x > max - r;
    const inTop = y < min + r;
    const inBottom = y > max - r;
    let cx;
    let cy;
    if (inLeft && inTop) {
      cx = min + r;
      cy = min + r;
    } else if (inRight && inTop) {
      cx = max - r;
      cy = min + r;
    } else if (inLeft && inBottom) {
      cx = min + r;
      cy = max - r;
    } else if (inRight && inBottom) {
      cx = max - r;
      cy = max - r;
    } else {
      return true; // straight edges / center
    }
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  };

  for (let y = 0; y < size; y++) {
    const t = y / (size - 1);
    const bg = [
      lerp(BRAND_TOP[0], BRAND_BOTTOM[0], t),
      lerp(BRAND_TOP[1], BRAND_BOTTOM[1], t),
      lerp(BRAND_TOP[2], BRAND_BOTTOM[2], t),
    ];
    for (let x = 0; x < size; x++) {
      if (inRoundedRect(x, y)) {
        setPixel(buf, size, x, y, bg, 255);
      } else {
        setPixel(buf, size, x, y, bg, 0); // transparent outside the badge
      }
    }
  }

  // Subtle top sheen: a soft, triangular falloff from the top edge for depth
  // (no hard band edges).
  const sheenEnd = Math.round(size * 0.42);
  for (let y = 0; y < sheenEnd; y++) {
    const boost = Math.round(16 * (1 - y / sheenEnd));
    if (boost <= 0) continue;
    for (let x = 0; x < size; x++) {
      if (!inRoundedRect(x, y)) continue;
      const i = (y * size + x) * 4;
      buf[i] = Math.min(255, buf[i] + boost);
      buf[i + 1] = Math.min(255, buf[i + 1] + boost);
      buf[i + 2] = Math.min(255, buf[i + 2] + boost);
    }
  }

  // "FG" centered.
  const glyphW = 5;
  const glyphH = 7;
  const gap = 1;
  const scale = Math.max(1, Math.floor((size * 0.5) / (glyphW * 2 + gap)));
  const textW = (glyphW * 2 + gap) * scale;
  const textH = glyphH * scale;
  const startX = Math.floor((size - textW) / 2);
  const startY = Math.floor((size - textH) / 2);
  drawGlyph(buf, size, GLYPHS.F, startX, startY, scale, WHITE);
  drawGlyph(buf, size, GLYPHS.G, startX + (glyphW + gap) * scale, startY, scale, WHITE);
  return buf;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(rgba, size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // Raw image data with a filter byte (0) per scanline.
  const rowBytes = size * 4;
  const raw = Buffer.alloc((rowBytes + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (rowBytes + 1)] = 0;
    rgba.copy(raw, y * (rowBytes + 1) + 1, y * rowBytes, (y + 1) * rowBytes);
  }
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  ['icon-512.png', 512],
  ['icon-192.png', 192],
  ['apple-touch-icon.png', 180],
  ['favicon.png', 48],
];

for (const [name, size] of targets) {
  const png = encodePng(renderIcon(size), size);
  fs.writeFileSync(path.join(outDir, name), png);
  console.log(`wrote public/${name} (${size}x${size}, ${png.length} bytes)`);
}
