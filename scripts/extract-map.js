// Build-time generator for lib/mapData.ts.
//
// Extracts + projects the 5 target countries (CH, DE, AT, FR, IT) plus a set of
// faint context neighbours from Natural Earth 1:50m Admin-0 Countries (PUBLIC
// DOMAIN — https://www.naturalearthdata.com/about/terms-of-use/, no attribution
// required) into one shared SVG viewBox framed on the Alpine / central-Europe
// cluster. Rings are simplified with Douglas–Peucker and overseas territories
// are clipped to the visible frame. Shapes are intentionally approximate.
//
// Usage:
//   curl -sSL https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson -o /tmp/ne50.geojson
//   node scripts/extract-map.js   # writes /tmp/mapData.ts -> copy to lib/mapData.ts
const fs = require('fs');
const SRC = process.env.NE_GEOJSON || '/tmp/ne50.geojson';
const gj = JSON.parse(fs.readFileSync(SRC, 'utf8'));

// ISO_A3 codes -> our app ids for the 5 tappable countries.
const TARGET = { CHE: 'ch', DEU: 'de', AUT: 'at', FRA: 'fr', ITA: 'it' };
// Faint context neighbors (drawn behind, low contrast, not tappable).
const NEIGHBORS = new Set([
  'BEL', 'NLD', 'LUX', 'CZE', 'POL', 'SVK', 'HUN', 'SVN', 'HRV', 'ESP',
  'GBR', 'DNK', 'BIH', 'SRB', 'GRC', 'LIE', 'MCO', 'AND', 'SMR', 'TUN',
]);

function iso(f) {
  const p = f.properties;
  return p.ISO_A3 !== '-99' ? p.ISO_A3 : p.ADM0_A3;
}

// View frame in lon/lat, centered on the Alpine / central-Europe cluster.
// FRA reaches ~ -5..8 lon, ITA reaches ~ 36 lat (Sicily), DE/PL ~ 55 lat.
const LON0 = -6.0, LON1 = 19.5; // west..east
const LAT0 = 35.5, LAT1 = 55.8; // south..north
const W = 1000;
// Web Mercator-ish vertical scaling using cos(midLat) keeps shapes recognizable.
const midLat = (LAT0 + LAT1) / 2;
const k = Math.cos((midLat * Math.PI) / 180);
const spanLon = LON1 - LON0;
const spanLat = LAT1 - LAT0;
const H = Math.round((W * (spanLat / spanLon)) * k);

function project([lon, lat]) {
  const x = ((lon - LON0) / spanLon) * W;
  const y = (1 - (lat - LAT0) / spanLat) * H;
  return [x, y];
}

// Perpendicular distance from p to the segment a-b (handles degenerate a≈b).
function segDist([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) return Math.hypot(px - ax, py - ay);
  return Math.abs((px - ax) * dy - (py - ay) * dx) / len;
}

// Douglas–Peucker on an OPEN polyline (px tolerance).
function rdpOpen(points, eps) {
  if (points.length < 3) return points;
  let dmax = 0, idx = 0;
  const a = points[0], b = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = segDist(points[i], a, b);
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax > eps) {
    const l = rdpOpen(points.slice(0, idx + 1), eps);
    const r = rdpOpen(points.slice(idx), eps);
    return l.slice(0, -1).concat(r);
  }
  return [a, b];
}

// Simplify a CLOSED ring: drop the duplicate closing vertex, anchor on the two
// most-distant points so the baseline isn't degenerate, RDP each arc, rejoin.
function rdp(ring, eps) {
  let pts = ring.slice();
  const f = pts[0], l = pts[pts.length - 1];
  if (pts.length > 1 && f[0] === l[0] && f[1] === l[1]) pts = pts.slice(0, -1);
  if (pts.length < 4) return ring;
  // Find the vertex farthest from pts[0] to use as the second anchor.
  let far = 1, fd = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]);
    if (d > fd) { fd = d; far = i; }
  }
  const arcA = pts.slice(0, far + 1);
  const arcB = pts.slice(far).concat([pts[0]]);
  const sa = rdpOpen(arcA, eps);
  const sb = rdpOpen(arcB, eps);
  return sa.slice(0, -1).concat(sb.slice(0, -1));
}

const r2 = (n) => Math.round(n * 10) / 10;

// Convert a polygon ring -> projected, simplified, rounded SVG subpath.
function ringToPath(ring, eps) {
  let pts = ring.map(project);
  pts = rdp(pts, eps);
  if (pts.length < 3) return '';
  let d = `M${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) d += `L${r2(pts[i][0])} ${r2(pts[i][1])}`;
  return d + 'Z';
}

// Area (px^2) of a projected ring — used to drop tiny islands/specks.
function ringArea(ring) {
  const pts = ring.map(project);
  let a = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % n];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
}

// True if a ring lies (mostly) inside the visible viewBox, with margin.
function ringInFrame(ring) {
  const m = 40; // px margin so coastlines near the edge aren't clipped
  let inside = 0;
  for (const c of ring) {
    const [x, y] = project(c);
    if (x >= -m && x <= W + m && y >= -m && y <= H + m) inside++;
  }
  // Keep the ring only if a meaningful share of its vertices are in-frame.
  return inside / ring.length > 0.4;
}

function geomToPath(geom, eps, minArea) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates]
    : geom.type === 'MultiPolygon' ? geom.coordinates : [];
  let d = '';
  for (const poly of polys) {
    // poly[0] outer ring; skip holes for our stylized fills.
    const outer = poly[0];
    if (ringArea(outer) < minArea) continue;
    if (!ringInFrame(outer)) continue; // drop overseas territories / far islands
    d += ringToPath(outer, eps);
  }
  return d;
}

const targets = {};
const neighbors = {};
for (const f of gj.features) {
  const code = iso(f);
  if (TARGET[code]) {
    targets[TARGET[code]] = geomToPath(f.geometry, 0.6, 4);
  } else if (NEIGHBORS.has(code)) {
    // Coarser simplification + bigger min area for faint background.
    neighbors[code] = geomToPath(f.geometry, 1.2, 20);
  }
}

const out = { width: W, height: H, targets, neighbors };
fs.writeFileSync('/tmp/mapdata.json', JSON.stringify(out));
console.log('viewBox', W, H, 'midLat', midLat.toFixed(1), 'k', k.toFixed(3));
for (const id of Object.keys(TARGET).map((c) => TARGET[c])) {
  console.log(id, (targets[id] || '').length, 'chars');
}
console.log('neighbors:', Object.keys(neighbors).length);
