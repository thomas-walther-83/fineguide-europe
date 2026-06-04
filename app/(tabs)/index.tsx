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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg.canvas }]} edges={['bottom']}>
      <FlatList
        data={COUNTRIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.heroTop}>
              <View style={styles.heroText}>
                <Text style={[type.display, { color: theme.text.primary }]}>{t('home.title')}</Text>
                <Text style={[type.body, styles.subtitle, { color: theme.text.secondary }]}>
                  {t('home.subtitle')}
                </Text>
              </View>
            </View>

            <LanguageSwitcher />

            <Link href="/compare" asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${t('compare.title')}. ${t('compare.subtitle')}`}
                style={({ pressed }) => [
                  styles.cta,
                  elevation(theme, 'raised'),
                  {
                    backgroundColor: pressed ? theme.brand.primaryPressed : theme.brand.primary,
                    transform: [{ scale: pressed ? PRESS_SCALE : 1 }],
                  },
                ]}
              >
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
  listContent: { padding: space[4] },
  header: { gap: space[5], paddingTop: space[2] },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start' },
  heroText: { flex: 1 },
  subtitle: { marginTop: space[1] },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: space[4],
    gap: space[3],
  },
  ctaIconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { flex: 1 },
  ctaSubtitle: { marginTop: 2, opacity: 0.9 },
});
