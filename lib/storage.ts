import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Tiny JSON key/value storage helper used for local persistence (favorites,
 * offline data cache). Backed by AsyncStorage, which transparently uses
 * `localStorage` on web and the platform store on native. All access is
 * best-effort: a failing read/write never throws to the caller — storage is a
 * cache, not a source of truth.
 */

/** Read and JSON-parse a value. Returns `fallback` when missing or unreadable. */
export async function getItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] failed to read "${key}":`, error);
    return fallback;
  }
}

/** JSON-stringify and persist a value. Swallows errors (storage is best-effort). */
export async function setItem(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] failed to write "${key}":`, error);
  }
}

/** Remove a value. Swallows errors. */
export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] failed to remove "${key}":`, error);
  }
}
