import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Tasteful, web-safe haptic feedback. expo-haptics is a no-op (and can warn)
 * on web, so every call is guarded for native platforms only. Failures are
 * swallowed — haptics are a nicety, never a hard dependency.
 */
const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

/** Light tap — selection of a pill/segment/toggle. */
export function tapSelect(): void {
  if (!enabled) return;
  Haptics.selectionAsync().catch(() => {});
}

/** Slightly firmer tap — opening a row / primary CTA. */
export function tapImpact(): void {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
