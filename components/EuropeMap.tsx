import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutChangeEvent,
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

/**
 * Interactive SVG map of the five covered countries (CH, DE, AT, FR, IT) framed
 * on the Alpine cluster, with faint neighbour silhouettes for context. Renders
 * identically on web (react-native-web) and native via react-native-svg.
 *
 * Each country is an accessible button (≥44pt effective target via the overlay
 * Pressables) that reports hover/press feedback and a flag chip near its
 * centroid. Geometry + colours are theme-aware.
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

  const dims = useMemo(() => {
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

  const handlePress = (id: string) => {
    tapImpact();
    onSelectCountry(id);
  };

  return (
    <View style={styles.fill} onLayout={onLayout}>
      {dims ? (
        <View style={[styles.stage, { width: dims.w, height: dims.h }]}>
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
                // stands out from the sea + faint neighbours. Compare (override):
                // the severity colour at full strength.
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
                    strokeWidth={isSelected ? 2.6 : isActive ? 2 : 1.3}
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
              identifiable without covering them with a wide label). */}
          {COUNTRIES.map((c) => {
            const anchor = COUNTRY_LABEL_ANCHORS[c.id];
            if (!anchor) return null;
            const left = anchor.x * dims.scale;
            const top = anchor.y * dims.scale;
            return (
              <View
                key={`lbl-${c.id}`}
                pointerEvents="none"
                style={[
                  styles.flagBadge,
                  {
                    left,
                    top,
                    backgroundColor: theme.bg.elevated,
                    borderColor: theme.border.subtle,
                  },
                ]}
              >
                <Text style={styles.badgeFlag}>{c.flag}</Text>
              </View>
            );
          })}

          {/* Accessible tap overlays — one per country anchor, ≥44pt target. */}
          {COUNTRIES.map((c) => {
            const anchor = COUNTRY_LABEL_ANCHORS[c.id];
            if (!anchor) return null;
            const left = anchor.x * dims.scale;
            const top = anchor.y * dims.scale;
            return (
              <Pressable
                key={`hit-${c.id}`}
                accessibilityRole="button"
                accessibilityLabel={t(c.nameKey)}
                accessibilityState={{ selected: selectedId === c.id }}
                onPress={() => handlePress(c.id)}
                onPressIn={() => setActive(c.id)}
                onPressOut={() => setActive(null)}
                onHoverIn={() => setActive(c.id)}
                onHoverOut={() => setActive(null)}
                style={[styles.hit, { left: left - 22, top: top - 22 }]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  stage: { position: 'relative' },
  flagBadge: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    transform: [{ translateX: -14 }, { translateY: -14 }],
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
  badgeFlag: { fontSize: 16, lineHeight: 19 },
  hit: { position: 'absolute', width: 44, height: 44, borderRadius: 22 },
});
