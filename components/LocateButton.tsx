import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { FlagChip } from '@/components/FlagChip';
import { Icon } from '@/components/Icon';
import { findCountry } from '@/lib/countries';
import { tapImpact, tapSelect } from '@/lib/haptics';
import { detectCountry } from '@/lib/location';
import { PRESS_SCALE, radius, space, type, useTheme } from '@/lib/theme';

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'found'; id: string }
  | { kind: 'message'; tone: 'neutral' | 'warn'; text: string };

/**
 * Compact "Where am I?" affordance for the home screen. Detects the current
 * country (CH/DE/AT/FR/IT) and, on success, navigates to its fines while
 * briefly surfacing a "You're in X" chip. Permission/availability failures are
 * shown inline as a quiet message. On-brand for light + dark, ≥44pt target.
 */
export function LocateButton() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  // Guard against a stale async result re-rendering after a newer press.
  const runId = useRef(0);

  const onPress = async () => {
    if (status.kind === 'loading') return;
    tapSelect();
    const id = ++runId.current;
    setStatus({ kind: 'loading' });
    const result = await detectCountry();
    if (id !== runId.current) return;

    if (typeof result === 'object') {
      const country = findCountry(result.id);
      if (!country) {
        setStatus({ kind: 'message', tone: 'warn', text: t('location.unavailable') });
        return;
      }
      tapImpact();
      setStatus({ kind: 'found', id: result.id });
      router.push({ pathname: '/country/[id]', params: { id: result.id } });
      return;
    }

    if (result === 'outside') {
      setStatus({ kind: 'message', tone: 'neutral', text: t('location.outside') });
    } else if (result === 'denied') {
      setStatus({ kind: 'message', tone: 'warn', text: t('location.denied') });
    } else {
      setStatus({ kind: 'message', tone: 'warn', text: t('location.unavailable') });
    }
  };

  const loading = status.kind === 'loading';
  const found = status.kind === 'found' ? findCountry(status.id) : undefined;

  const label = loading
    ? t('location.detecting')
    : found
      ? t('location.youAreIn', { country: t(found.nameKey) })
      : t('location.button');

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('location.button')}
        accessibilityState={{ busy: loading }}
        disabled={loading}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.bg.surface,
            borderColor: theme.border.subtle,
            transform: [{ scale: pressed ? PRESS_SCALE : 1 }],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.brand.primary} />
        ) : found ? (
          <FlagChip flag={found.flag} size={22} />
        ) : (
          <Icon name="globe" size={20} color={theme.brand.primary} />
        )}
        <Text
          style={[type.bodyStrong, styles.label, { color: theme.text.primary }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {!loading && !found ? (
          <Icon name="chevron-right" size={18} color={theme.text.tertiary} />
        ) : null}
      </Pressable>

      {status.kind === 'message' ? (
        <Text
          style={[
            type.caption,
            styles.message,
            { color: status.tone === 'warn' ? theme.severity.high : theme.text.tertiary },
          ]}
        >
          {status.text}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[1] },
  button: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: { flex: 1 },
  message: { textAlign: 'center', paddingHorizontal: space[2] },
});
