import { StyleSheet, View, type ViewStyle } from 'react-native';

/**
 * Tiny dependency-free line-icon set, drawn with Views so icons stay crisp and
 * tint cleanly on web + native (no emoji-as-data, no extra native deps). Each
 * icon is sized by `size` and coloured by `color`; stroke weight scales with it.
 */
export type IconName =
  | 'chevron-right'
  | 'search'
  | 'globe'
  | 'compare'
  | 'languages'
  | 'calc'
  | 'trip'
  | 'star'
  | 'star-filled';

type Props = {
  name: IconName;
  size?: number;
  color: string;
  style?: ViewStyle;
};

export function Icon({ name, size = 20, color, style }: Props) {
  const stroke = Math.max(1.5, Math.round(size * 0.1));
  const box: ViewStyle = { width: size, height: size, alignItems: 'center', justifyContent: 'center' };

  if (name === 'chevron-right') {
    const arm = size * 0.34;
    return (
      <View style={[box, style]}>
        <View style={{ width: arm, height: arm, transform: [{ rotate: '45deg' }] }}>
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: arm,
              height: stroke,
              backgroundColor: color,
              borderRadius: stroke,
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: stroke,
              height: arm,
              backgroundColor: color,
              borderRadius: stroke,
            }}
          />
        </View>
      </View>
    );
  }

  if (name === 'search') {
    const ring = size * 0.6;
    const handle = size * 0.34;
    return (
      <View style={[box, style]}>
        <View style={{ width: size, height: size }}>
          <View
            style={{
              position: 'absolute',
              top: size * 0.06,
              left: size * 0.06,
              width: ring,
              height: ring,
              borderRadius: ring / 2,
              borderWidth: stroke,
              borderColor: color,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: size * 0.08,
              right: size * 0.08,
              width: handle,
              height: stroke,
              backgroundColor: color,
              borderRadius: stroke,
              transform: [{ rotate: '45deg' }],
            }}
          />
        </View>
      </View>
    );
  }

  if (name === 'globe' || name === 'languages') {
    const d = size * 0.82;
    return (
      <View style={[box, style]}>
        <View
          style={{
            width: d,
            height: d,
            borderRadius: d / 2,
            borderWidth: stroke,
            borderColor: color,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* meridian */}
          <View style={{ position: 'absolute', width: stroke, height: d, backgroundColor: color }} />
          {/* vertical ellipse approximated by a narrow rounded outline */}
          <View
            style={{
              position: 'absolute',
              width: d * 0.5,
              height: d,
              borderRadius: d / 2,
              borderWidth: stroke,
              borderColor: color,
            }}
          />
          {/* equator */}
          <View style={{ position: 'absolute', width: d, height: stroke, backgroundColor: color }} />
        </View>
      </View>
    );
  }

  if (name === 'calc') {
    const d = size * 0.86;
    const screenH = d * 0.26;
    const dot = Math.max(2, d * 0.16);
    return (
      <View style={[box, style]}>
        <View
          style={{
            width: d * 0.78,
            height: d,
            borderRadius: stroke * 1.5,
            borderWidth: stroke,
            borderColor: color,
            padding: stroke,
          }}
        >
          <View style={{ height: screenH, backgroundColor: color, borderRadius: stroke * 0.6 }} />
          <View style={{ flex: 1, justifyContent: 'space-evenly', paddingTop: stroke }}>
            {[0, 1].map((r) => (
              <View key={r} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }} />
                <View style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }} />
                <View style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }} />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (name === 'star' || name === 'star-filled') {
    // A 5-point star composed of three overlapping triangles (rotated
    // 0°/72°/144°), drawn with the CSS triangle border-trick so it tints
    // cleanly and stays crisp on web + native without an SVG dependency.
    // Both variants share one silhouette; the favorited (`star-filled`) vs
    // un-favorited (`star`) state is conveyed by `color` and a lower opacity
    // for the outline, matching this colour-driven icon set.
    const filled = name === 'star-filled';
    const triBase = size;
    const triHeight = size * 0.62;
    return (
      <View style={[box, { width: size, height: size }, style]}>
        <View
          style={{
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: filled ? 1 : 0.5,
          }}
        >
          {[0, 72, 144].map((rotate, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: 0,
                height: 0,
                borderLeftWidth: triBase / 2,
                borderRightWidth: triBase / 2,
                borderBottomWidth: triHeight,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: color,
                transform: [{ rotate: `${rotate}deg` }],
              }}
            />
          ))}
        </View>
      </View>
    );
  }

  if (name === 'trip') {
    // A route marker: an origin ring and a filled destination dot joined by a
    // line — the "home → destination" idea, drawn with Views (no SVG dep).
    const dot = Math.max(stroke * 2, size * 0.26);
    const ring = dot;
    return (
      <View style={[box, style]}>
        <View
          style={{
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}
        >
          {/* origin ring (home) */}
          <View
            style={{
              width: ring,
              height: ring,
              borderRadius: ring / 2,
              borderWidth: stroke,
              borderColor: color,
            }}
          />
          {/* connecting line */}
          <View
            style={{
              flex: 1,
              height: stroke,
              marginHorizontal: stroke,
              backgroundColor: color,
              borderRadius: stroke,
            }}
          />
          {/* destination dot (filled) */}
          <View
            style={{
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: color,
            }}
          />
        </View>
      </View>
    );
  }

  // compare: three ascending bars
  const gap = size * 0.16;
  const barW = (size - gap * 2) / 3;
  const heights = [size * 0.45, size * 0.72, size * 1.0];
  return (
    <View style={[box, style]}>
      <View style={styles.barsRow}>
        {heights.map((h, i) => (
          <View
            key={i}
            style={{
              width: barW,
              height: h,
              marginLeft: i === 0 ? 0 : gap,
              backgroundColor: color,
              borderTopLeftRadius: stroke,
              borderTopRightRadius: stroke,
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barsRow: { flexDirection: 'row', alignItems: 'flex-end' },
});
