import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { COUNTRIES } from '@/lib/countries';
import { tapImpact } from '@/lib/haptics';
import {
  COUNTRY_LABEL_ANCHORS,
  COUNTRY_PATHS,
  MAP_VIEWBOX,
  NEIGHBOR_PATHS,
} from '@/lib/mapData';
import { radius, useTheme } from '@/lib/theme';

type Props = {
  /** Called with the country id when a country shape is tapped. */
  onSelectCountry: (id: string) => void;
  /** Optional per-country fill override (e.g. severity colour-coding). */
  fillFor?: (id: string) => string | undefined;
  /** Optional currently-selected country id (gets an emphasised outline). */
  selectedId?: string;
  /** Optional cap on rendered height (px) so the map never overflows. */
  maxHeight?: number;
};

const ASPECT = MAP_VIEWBOX.width / MAP_VIEWBOX.height;

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const MOVE_CAPTURE = 6; // px of finger travel before we treat it as a pan
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

type Dims = { w: number; h: number; scale: number };

/**
 * Interactive SVG map of the covered countries (faint neighbour silhouettes for
 * context). Renders identically on web (react-native-web) and native via
 * react-native-svg.
 *
 * Zoom & pan: because the map now spans Portugal→Greece, small/central
 * countries are tiny at the default extent. The whole stage can be pinch-zoomed
 * and dragged (and wheel-zoomed on desktop, plus on-screen +/−/reset controls).
 * The transform uses a top-left origin so screen = scale·point + translate, and
 * the flag badges + tap targets are counter-scaled (1/scale) so they stay a
 * constant, tappable size at any zoom. A single tap still selects a country —
 * the pan responder only engages once a finger actually drags or two fingers
 * pinch, so taps fall through to the per-country buttons.
 *
 * Each country is an accessible button (≥44pt effective target via the overlay
 * Pressables) with a flag chip near its centroid. Geometry + colours are
 * theme-aware.
 */
export function EuropeMap({ onSelectCountry, fillFor, selectedId, maxHeight }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [active, setActive] = useState<string | null>(null);
  const [box, setBox] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Fit the fixed-aspect map into whatever space the parent gives us.
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setBox({ w: width, h: height });
  };

  const dims = useMemo<Dims | null>(() => {
    const availH = maxHeight ? Math.min(box.h || maxHeight, maxHeight) : box.h;
    if (!box.w || !availH) return null;
    let w = box.w;
    let h = w / ASPECT;
    if (h > availH) {
      h = availH;
      w = h * ASPECT;
    }
    return { w, h, scale: w / MAP_VIEWBOX.width };
  }, [box, maxHeight]);

  // --- Zoom/pan state ------------------------------------------------------
  // Animated values drive the transform without React re-renders (smooth).
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const inv = useRef(Animated.divide(1, scaleAnim)).current; // 1/scale for chips
  // Plain mirrors of the current transform (Animated has no sync getter).
  const sRef = useRef(1);
  const tRef = useRef({ x: 0, y: 0 });
  // Latest dims for the gesture handlers (created once, must read fresh dims).
  const dimsRef = useRef<Dims | null>(dims);
  dimsRef.current = dims;
  // Active gesture snapshot taken when a drag/pinch begins.
  const gesture = useRef<
    | { mode: 'pan' | 'pinch'; s0: number; t0: { x: number; y: number }; d0: number; f0: { x: number; y: number } }
    | null
  >(null);

  const clampT = (s: number, t: { x: number; y: number }, d: Dims) => ({
    // Keep the scaled content covering the stage (no gaps): t ∈ [-(s-1)·size, 0].
    x: clamp(t.x, -(s - 1) * d.w, 0),
    y: clamp(t.y, -(s - 1) * d.h, 0),
  });

  const apply = (s: number, t: { x: number; y: number }) => {
    const d = dimsRef.current;
    if (!d) return;
    const ns = clamp(s, MIN_ZOOM, MAX_ZOOM);
    const nt = clampT(ns, t, d);
    sRef.current = ns;
    tRef.current = nt;
    scaleAnim.setValue(ns);
    pan.setValue(nt);
  };

  // Zoom by `factor` keeping the point `f` (stage-local px) under the cursor.
  const zoomAbout = (f: { x: number; y: number }, factor: number) => {
    const s0 = sRef.current;
    const s1 = clamp(s0 * factor, MIN_ZOOM, MAX_ZOOM);
    const r = s1 / s0;
    const t0 = tRef.current;
    apply(s1, { x: (1 - r) * f.x + r * t0.x, y: (1 - r) * f.y + r * t0.y });
  };

  const reset = () => {
    gesture.current = null;
    sRef.current = 1;
    tRef.current = { x: 0, y: 0 };
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: false, bounciness: 4 }),
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, bounciness: 4 }),
    ]).start();
  };

  const zoomButton = (factor: number) => () => {
    const d = dimsRef.current;
    if (!d) return;
    zoomAbout({ x: d.w / 2, y: d.h / 2 }, factor);
  };

  // Reset the view whenever the stage is (re)sized so we never get stuck panned.
  useEffect(() => {
    scaleAnim.setValue(1);
    pan.setValue({ x: 0, y: 0 });
    sRef.current = 1;
    tRef.current = { x: 0, y: 0 };
    gesture.current = null;
  }, [dims?.w, dims?.h, pan, scaleAnim]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Let plain taps fall through to the per-country buttons.
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        // Engage only on a real drag or a two-finger pinch.
        onMoveShouldSetPanResponder: (e: GestureResponderEvent, g) =>
          e.nativeEvent.touches.length >= 2 ||
          Math.hypot(g.dx, g.dy) > MOVE_CAPTURE,
        onMoveShouldSetPanResponderCapture: (e: GestureResponderEvent, g) =>
          e.nativeEvent.touches.length >= 2 ||
          Math.hypot(g.dx, g.dy) > MOVE_CAPTURE,
        onPanResponderMove: (e: GestureResponderEvent) => {
          const d = dimsRef.current;
          if (!d) return;
          const touches = e.nativeEvent.touches;
          if (touches.length >= 2) {
            const a = { x: touches[0].locationX, y: touches[0].locationY };
            const b = { x: touches[1].locationX, y: touches[1].locationY };
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            const dd = dist(a, b);
            if (!gesture.current || gesture.current.mode !== 'pinch') {
              gesture.current = { mode: 'pinch', s0: sRef.current, t0: { ...tRef.current }, d0: dd || 1, f0: mid };
            }
            const st = gesture.current;
            const s1 = clamp(st.s0 * (dd / st.d0), MIN_ZOOM, MAX_ZOOM);
            const r = s1 / st.s0;
            // Keep the start focal point fixed, and follow the midpoint's travel.
            apply(s1, {
              x: (1 - r) * st.f0.x + r * st.t0.x + (mid.x - st.f0.x),
              y: (1 - r) * st.f0.y + r * st.t0.y + (mid.y - st.f0.y),
            });
          } else if (touches.length === 1) {
            const p = { x: touches[0].locationX, y: touches[0].locationY };
            if (!gesture.current || gesture.current.mode !== 'pan') {
              gesture.current = { mode: 'pan', s0: sRef.current, t0: { ...tRef.current }, d0: 0, f0: p };
            }
            const st = gesture.current;
            apply(st.s0, { x: st.t0.x + (p.x - st.f0.x), y: st.t0.y + (p.y - st.f0.y) });
          }
        },
        onPanResponderRelease: () => {
          gesture.current = null;
        },
        onPanResponderTerminate: () => {
          gesture.current = null;
        },
      }),
    // Created once; reads live state via refs.
    [apply, pan, scaleAnim]
  );

  const handlePress = (id: string) => {
    tapImpact();
    onSelectCountry(id);
  };

  // Desktop trackpad / mouse-wheel zoom toward the cursor (web only).
  const webWheel =
    Platform.OS === 'web'
      ? {
          onWheel: (e: { preventDefault?: () => void; nativeEvent: { offsetX: number; offsetY: number; deltaY: number } }) => {
            e.preventDefault?.();
            const ne = e.nativeEvent;
            zoomAbout({ x: ne.offsetX, y: ne.offsetY }, Math.exp(-ne.deltaY * 0.0015));
          },
        }
      : {};
  // Stop the browser from hijacking touch gestures (page scroll / pinch-zoom).
  const webTouchAction = Platform.OS === 'web' ? ({ touchAction: 'none' } as object) : null;

  const contentTransform = [...pan.getTranslateTransform(), { scale: scaleAnim }];

  return (
    <View style={styles.fill} onLayout={onLayout}>
      {dims ? (
        <View
          style={[styles.stage, { width: dims.w, height: dims.h }, webTouchAction]}
          {...panResponder.panHandlers}
          {...webWheel}
        >
          <Animated.View
            style={{
              width: dims.w,
              height: dims.h,
              transformOrigin: '0% 0%',
              transform: contentTransform,
            }}
          >
            <Svg
              width={dims.w}
              height={dims.h}
              viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
            >
              {/* Faint neighbour silhouettes for geographic context. */}
              <G>
                {NEIGHBOR_PATHS.map((d, i) => (
                  <Path
                    key={`n${i}`}
                    d={d}
                    fill={theme.bg.surfaceAlt}
                    stroke={theme.border.subtle}
                    strokeWidth={0.6}
                    opacity={theme.mode === 'dark' ? 0.5 : 0.7}
                  />
                ))}
              </G>

              {/* Target countries. */}
              <G>
                {COUNTRIES.map((c) => {
                  const d = COUNTRY_PATHS[c.id];
                  if (!d) return null;
                  const isActive = active === c.id;
                  const isSelected = selectedId === c.id;
                  const override = fillFor?.(c.id);
                  // Home (no override): strong brand-tinted land that clearly
                  // stands out from the sea + faint neighbours. Compare
                  // (override): the severity colour at full strength.
                  const fill = override ?? theme.brand.primary;
                  const fillOpacity = override ? (isActive ? 0.85 : 1) : isActive ? 0.65 : 0.34;
                  const stroke = isSelected
                    ? theme.brand.primary
                    : isActive
                      ? theme.text.primary
                      : override
                        ? theme.border.strong
                        : theme.brand.primary;
                  return (
                    <Path
                      key={c.id}
                      d={d}
                      fill={fill}
                      fillOpacity={fillOpacity}
                      stroke={stroke}
                      strokeWidth={isSelected ? 2.8 : isActive ? 2.2 : 1.7}
                      strokeLinejoin="round"
                      // Tapping anywhere on the shape selects it (web + native).
                      onPress={() => handlePress(c.id)}
                      onPressIn={() => setActive(c.id)}
                      onPressOut={() => setActive(null)}
                      {...(Platform.OS === 'web'
                        ? {
                            onMouseEnter: () => setActive(c.id),
                            onMouseLeave: () => setActive(null),
                          }
                        : {})}
                    />
                  );
                })}
              </G>
            </Svg>

            {/* Flag-only badges at each country centroid (keeps small countries
                identifiable without covering them with a wide label).
                Counter-scaled by 1/zoom so they stay a constant size. */}
            {COUNTRIES.map((c) => {
              const anchor = COUNTRY_LABEL_ANCHORS[c.id];
              if (!anchor) return null;
              const left = anchor.x * dims.scale;
              const top = anchor.y * dims.scale;
              return (
                <Animated.View
                  key={`lbl-${c.id}`}
                  pointerEvents="none"
                  style={[
                    styles.flagBadge,
                    {
                      left,
                      top,
                      backgroundColor: theme.bg.elevated,
                      borderColor: theme.border.subtle,
                      transform: [{ translateX: -12 }, { translateY: -12 }, { scale: inv }],
                    },
                  ]}
                >
                  <Text style={styles.badgeFlag}>{c.flag}</Text>
                </Animated.View>
              );
            })}

            {/* Accessible tap overlays — one per country anchor, ≥44pt target.
                Counter-scaled so the hit area stays 44pt at any zoom. */}
            {COUNTRIES.map((c) => {
              const anchor = COUNTRY_LABEL_ANCHORS[c.id];
              if (!anchor) return null;
              const left = anchor.x * dims.scale;
              const top = anchor.y * dims.scale;
              return (
                <Animated.View
                  key={`hit-${c.id}`}
                  style={[styles.hit, { left: left - 22, top: top - 22, transform: [{ scale: inv }] }]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t(c.nameKey)}
                    accessibilityState={{ selected: selectedId === c.id }}
                    onPress={() => handlePress(c.id)}
                    onPressIn={() => setActive(c.id)}
                    onPressOut={() => setActive(null)}
                    onHoverIn={() => setActive(c.id)}
                    onHoverOut={() => setActive(null)}
                    style={styles.hitInner}
                  />
                </Animated.View>
              );
            })}
          </Animated.View>

          {/* Zoom controls (fixed to the stage, do not pan/zoom with content). */}
          <View style={styles.controls} pointerEvents="box-none">
            <ZoomButton label="+" onPress={zoomButton(1.6)} theme={theme} accessibilityLabel={t('map.zoomIn')} />
            <ZoomButton label="−" onPress={zoomButton(0.625)} theme={theme} accessibilityLabel={t('map.zoomOut')} />
            <ZoomButton label="⤢" onPress={reset} theme={theme} accessibilityLabel={t('map.reset')} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function ZoomButton({
  label,
  onPress,
  theme,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.zoomBtn,
        {
          backgroundColor: theme.bg.elevated,
          borderColor: theme.border.subtle,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[styles.zoomBtnLabel, { color: theme.text.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  stage: { position: 'relative', overflow: 'hidden' },
  flagBadge: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(11,18,32,0.22)' } as object,
      default: {
        shadowColor: '#0B1220',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      },
    }),
  },
  badgeFlag: { fontSize: 14, lineHeight: 17 },
  hit: { position: 'absolute', width: 44, height: 44 },
  hitInner: { width: 44, height: 44, borderRadius: 22 },
  controls: {
    position: 'absolute',
    top: 8,
    right: 8,
    gap: 6,
  },
  zoomBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(11,18,32,0.18)' } as object,
      default: {
        shadowColor: '#0B1220',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
      },
    }),
  },
  zoomBtnLabel: { fontSize: 20, lineHeight: 24, fontWeight: '600' },
});
