import { Platform } from 'react-native';

/**
 * Cross-platform "Where am I?" country detection for the five covered
 * countries (CH/DE/AT/FR/IT). No external geocoding API and no keys: we read
 * the device coordinates and map them to a country with small, hand-traced
 * country outline polygons + a point-in-polygon test.
 *
 * Native (iOS/Android) uses `expo-location`; web uses the standard
 * `navigator.geolocation` API, which prompts for permission itself. The
 * `expo-location` module is only ever required from the native code path
 * (behind a `Platform.OS !== 'web'` guard), so the web bundle never invokes a
 * native-only API at import time.
 */

export type DetectResult = { id: string } | 'outside' | 'denied' | 'unavailable';

type Coords = { latitude: number; longitude: number };

/** A polygon ring as `[longitude, latitude]` pairs. */
type Ring = [number, number][];

/**
 * Coarse mainland outline polygons (`[lng, lat]`) for the five covered
 * countries. These are deliberately low-vertex approximations — accurate
 * enough to answer "which of these five countries am I in?" while staying
 * tiny and dependency-free. Order matters only for performance; polygons do
 * not overlap meaningfully, so the first containing polygon wins.
 */
const COUNTRY_POLYGONS: { id: string; ring: Ring }[] = [
  {
    id: 'ch',
    ring: [
      [6.0, 46.2],
      [5.96, 46.45],
      [6.9, 47.5],
      [8.6, 47.8],
      [9.6, 47.55],
      [10.5, 46.85],
      [9.0, 45.82],
      [7.0, 45.92],
      [6.0, 46.2],
    ],
  },
  {
    id: 'at',
    ring: [
      [9.53, 47.5],
      [9.75, 47.6],
      [10.2, 47.3],
      [12.0, 47.6],
      [13.5, 48.6],
      [15.0, 48.9],
      [17.16, 48.0],
      [16.0, 46.9],
      [13.7, 46.5],
      [12.2, 46.7],
      [10.4, 46.55],
      [9.53, 47.0],
      [9.53, 47.5],
    ],
  },
  {
    id: 'it',
    ring: [
      [7.0, 45.0],
      [7.7, 45.9],
      [9.0, 46.0],
      [10.5, 46.6],
      [12.4, 46.7],
      [13.7, 45.7],
      [13.2, 45.6],
      [12.3, 44.2],
      [15.5, 41.9],
      [18.5, 40.0],
      [16.0, 37.9],
      [15.6, 38.0],
      [12.5, 37.8],
      [8.0, 44.0],
      [7.5, 43.78],
      [7.0, 45.0],
    ],
  },
  {
    id: 'fr',
    ring: [
      [-4.8, 48.3],
      [-1.5, 49.9],
      [2.5, 51.1],
      [8.2, 49.0],
      [7.6, 47.6],
      [6.9, 47.45],
      [6.0, 46.45],
      [6.0, 46.2],
      [7.0, 45.9],
      [7.55, 43.9],
      [6.5, 43.0],
      [3.0, 43.2],
      [-1.8, 43.3],
      [-1.4, 46.0],
      [-4.8, 48.3],
    ],
  },
  {
    id: 'de',
    ring: [
      [5.87, 51.0],
      [6.0, 52.5],
      [8.0, 55.06],
      [10.0, 54.5],
      [13.8, 54.0],
      [14.8, 51.0],
      [13.5, 48.6],
      [12.0, 47.6],
      [10.2, 47.3],
      [8.6, 47.8],
      [7.6, 47.6],
      [8.2, 49.0],
      [6.0, 51.0],
      [5.87, 51.0],
    ],
  },
];

/** Standard ray-casting point-in-polygon test. `point` is `[lng, lat]`. */
function pointInRing(point: [number, number], ring: Ring): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/**
 * Map coordinates to one of the five countries, or `'outside'` if the point
 * lies in none of their outlines. Exposed for testing/reuse.
 */
export function countryForCoords(coords: Coords): { id: string } | 'outside' {
  const point: [number, number] = [coords.longitude, coords.latitude];
  for (const country of COUNTRY_POLYGONS) {
    if (pointInRing(point, country.ring)) return { id: country.id };
  }
  return 'outside';
}

/** Get the current coordinates on web via the browser geolocation API. */
function getWebCoords(): Promise<Coords | 'denied' | 'unavailable'> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve('unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => {
        // 1 === PERMISSION_DENIED
        resolve(err.code === 1 ? 'denied' : 'unavailable');
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 },
    );
  });
}

/** Get the current coordinates on native via expo-location. */
async function getNativeCoords(): Promise<Coords | 'denied' | 'unavailable'> {
  try {
    // Required from the native path only; web never reaches this branch.
    const Location = require('expo-location') as typeof import('expo-location');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return 'denied';
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return 'unavailable';
  }
}

/**
 * Detect the user's current country among the five covered ones.
 * Resolves to `{ id }`, `'outside'`, `'denied'`, or `'unavailable'`.
 */
export async function detectCountry(): Promise<DetectResult> {
  const coords =
    Platform.OS === 'web' ? await getWebCoords() : await getNativeCoords();
  if (coords === 'denied' || coords === 'unavailable') return coords;
  return countryForCoords(coords);
}
