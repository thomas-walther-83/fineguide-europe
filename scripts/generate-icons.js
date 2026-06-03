// Generates the PWA / home-screen icons for FineGuide Europe.
// No external image tooling required — encodes PNGs directly.
// Run with: node scripts/generate-icons.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BRAND = [10, 126, 164]; // #0a7ea4
const WHITE = [255, 255, 255];

// 5x7 pixel glyphs for the letters we need.
const GLYPHS = {
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
};

function setPixel(buf, size, x, y, [r, g, b]) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const i = (y * size + x) * 3;
  buf[i] = r;
  buf[i + 1] = g;
  buf[i + 2] = b;
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
  const buf = Buffer.alloc(size * size * 3);
  // Background fill.
  for (let i = 0; i < size * size; i++) {
    buf[i * 3] = BRAND[0];
    buf[i * 3 + 1] = BRAND[1];
    buf[i * 3 + 2] = BRAND[2];
  }
  // "FG" centered.
  const glyphW = 5;
  const glyphH = 7;
  const gap = 1;
  const scale = Math.floor((size * 0.62) / (glyphW * 2 + gap));
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

function encodePng(rgb, size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  // Raw image data with a filter byte (0) per scanline.
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    rgb.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
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
