import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EuropeMap } from '@/components/EuropeMap';
import { FlagChip } from '@/components/FlagChip';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LocateButton } from '@/components/LocateButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { COUNTRIES, findCountry } from '@/lib/countries';
import { useFavorites } from '@/lib/favorites';
import { tapImpact } from '@/lib/haptics';
import { layout, PRESS_SCALE, radius, space, type, useTheme } from '@/lib/theme';

export default function CountriesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { favorites } = useFavorites();

  const favoriteCountries = favorites
    .map((id) => findCountry(id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  const openCountry = (id: string) => {
    router.push({ pathname: '/country/[id]', params: { id } });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg.canvas }]} edges={['top']}>
      <ScreenHeader title={t('home.title')} subtitle={t('home.subtitle')} />

      <View style={styles.controls}>
        <LanguageSwitcher />
      </View>

      {/* "Where am I?" — detect the current country and jump to its fines. */}
      <View style={styles.locateWrap}>
        <LocateButton />
      </View>

      {/* The map is the primary country picker and fills the remaining space. */}
      <View style={styles.mapWrap}>
        <EuropeMap onSelectCountry={openCountry} />
      </View>

      <View style={styles.footer}>
        {favoriteCountries.length > 0 ? (
          <View style={styles.favRow}>
            {favoriteCountries.map((country) => (
              <Pressable
                key={country.id}
                accessibilityRole="link"
                accessibilityLabel={t(country.nameKey)}
                onPress={() => {
                  tapImpact();
                  openCountry(country.id);
                }}
                style={({ pressed }) => [
                  styles.favChip,
                  {
                    backgroundColor: theme.bg.surface,
                    borderColor: theme.border.subtle,
                    transform: [{ scale: pressed ? PRESS_SCALE : 1 }],
                  },
                ]}
              >
                <FlagChip flag={country.flag} size={22} />
                <Text style={[type.captionStrong, { color: theme.text.secondary }]}>
                  {t(country.nameKey)}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <Text style={[type.caption, styles.hint, { color: theme.text.tertiary }]} numberOfLines={1}>
          {t('home.pickHint')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controls: { paddingHorizontal: layout.screenX, paddingBottom: space[2] },
  locateWrap: { paddingHorizontal: layout.screenX, paddingBottom: space[2] },
  mapWrap: { flex: 1, paddingHorizontal: space[2], minHeight: 0 },
  footer: {
    paddingHorizontal: layout.screenX,
    paddingTop: space[2],
    paddingBottom: space[2],
    gap: space[2],
  },
  favRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], justifyContent: 'center' },
  favChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[1],
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  hint: { textAlign: 'center' },
});
