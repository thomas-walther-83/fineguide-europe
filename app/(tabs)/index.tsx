import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CountryListItem } from '@/components/CountryListItem';
import { Icon } from '@/components/Icon';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SectionHeader } from '@/components/SectionHeader';
import { COUNTRIES, findCountry } from '@/lib/countries';
import { useFavorites } from '@/lib/favorites';
import { tapImpact } from '@/lib/haptics';
import { elevation, PRESS_SCALE, radius, space, type, useTheme } from '@/lib/theme';

export default function CountriesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { favorites } = useFavorites();

  // Favorite countries, in the order the user starred them; ignore any stale ids.
  const favoriteCountries = favorites
    .map((id) => findCountry(id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg.canvas }]} edges={['top']}>
      <FlatList
        data={COUNTRIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.heroTop}>
              <View style={styles.heroText}>
                <Text style={[type.label, styles.eyebrow, { color: theme.brand.primary }]}>
                  {t('home.title')}
                </Text>
                <Text style={[type.hero, { color: theme.text.primary }]}>{t('home.subtitle')}</Text>
              </View>
            </View>

            <LanguageSwitcher />

            <Link href="/compare" asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${t('compare.title')}. ${t('compare.subtitle')}`}
                onPress={tapImpact}
                style={({ pressed }) => [
                  styles.cta,
                  elevation(theme, 'raised'),
                  {
                    backgroundColor: pressed ? theme.brand.primaryPressed : theme.brand.primary,
                    transform: [{ scale: pressed ? PRESS_SCALE : 1 }],
                  },
                ]}
              >
                {/* decorative severity ramp on the CTA edge */}
                <View pointerEvents="none" style={styles.ctaRamp}>
                  <View style={[styles.rampSeg, { backgroundColor: theme.severity.low }]} />
                  <View style={[styles.rampSeg, { backgroundColor: theme.severity.mid }]} />
                  <View style={[styles.rampSeg, { backgroundColor: theme.severity.high }]} />
                </View>
                <View style={styles.ctaIconBadge}>
                  <Icon name="compare" size={22} color={theme.brand.onPrimary} />
                </View>
                <View style={styles.ctaText}>
                  <Text style={[type.h2, { color: theme.brand.onPrimary }]}>
                    {t('compare.title')}
                  </Text>
                  <Text style={[type.caption, styles.ctaSubtitle, { color: theme.brand.onPrimary }]}>
                    {t('compare.subtitle')}
                  </Text>
                </View>
                <Icon name="chevron-right" size={22} color={theme.brand.onPrimary} />
              </Pressable>
            </Link>

            {favoriteCountries.length > 0 && (
              <View>
                <SectionHeader title={t('favorites.title')} />
                {favoriteCountries.map((country) => (
                  <CountryListItem key={country.id} country={country} />
                ))}
              </View>
            )}

            <SectionHeader title={t('tabs.countries')} />
          </View>
        }
        renderItem={({ item }) => <CountryListItem country={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: space[4], paddingBottom: space[12] },
  header: { gap: space[5], paddingTop: space[2] },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start' },
  heroText: { flex: 1, gap: space[1] },
  eyebrow: {},
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: space[4],
    paddingLeft: space[5],
    gap: space[3],
    overflow: 'hidden',
  },
  ctaRamp: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  rampSeg: { flex: 1 },
  ctaIconBadge: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { flex: 1 },
  ctaSubtitle: { marginTop: 2, opacity: 0.92 },
});
