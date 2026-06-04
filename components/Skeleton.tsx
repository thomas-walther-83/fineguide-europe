import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
  type DimensionValue,
  type ViewStyle,
} from 'react-native';

import { elevation, radius, space, useTheme } from '@/lib/theme';

type BlockProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

function usePulse() {
  const value = useRef(new Animated.Value(0.5)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => mounted && setReduceMotion(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) =>
      mounted ? setReduceMotion(v) : undefined,
    );
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      value.setValue(0.7);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0.5,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, value]);

  return value;
}

/** A single shimmering placeholder block. */
export function SkeletonBlock({ width = '100%', height = 14, radius: r = 6, style }: BlockProps) {
  const theme = useTheme();
  const opacity = usePulse();
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: r, backgroundColor: theme.bg.surfaceAlt, opacity },
        style,
      ]}
    />
  );
}

/** A placeholder list row matching CountryListItem proportions. */
export function SkeletonRow() {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.row,
        { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
        elevation(theme, 'card'),
      ]}
    >
      <SkeletonBlock width={30} height={22} radius={6} />
      <View style={styles.rowText}>
        <SkeletonBlock width="55%" height={15} />
        <SkeletonBlock width="38%" height={12} style={{ marginTop: space[2] }} />
      </View>
    </View>
  );
}

/** A placeholder fine/result card. */
export function SkeletonCard() {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
        elevation(theme, 'card'),
      ]}
    >
      <View style={styles.cardHeader}>
        <SkeletonBlock width="45%" height={15} />
        <SkeletonBlock width={64} height={18} radius={6} />
      </View>
      <SkeletonBlock width="85%" height={13} style={{ marginTop: space[3] }} />
    </View>
  );
}

/** Renders `count` skeleton elements of `kind`. */
export function SkeletonList({ count = 5, kind = 'row' }: { count?: number; kind?: 'row' | 'card' }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ marginBottom: space[3] }}>
          {kind === 'row' ? <SkeletonRow /> : <SkeletonCard />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    padding: space[4],
    minHeight: 64,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowText: { flex: 1 },
  card: {
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
