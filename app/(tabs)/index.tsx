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

// Fixed strong blue for the Compare CTA so white text always has good contrast
// in both light and dark.
const CTA_BLUE = '#2563E6';
const CTA_BLUE_PRESSED = '#1B4FCC';

export default function CountriesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { favorites } = useFavorites();

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
            <View>
              <Text style={[type.display, { color: theme.text.primary }]}>{t('home.title')}</Text>
              <Text style={[type.caption, styles.subtitle, { color: theme.text.secondary }]} numberOfLines={2}>
                {t('home.subtitle')}
              </Text>
            </View>

            <LanguageSwitcher />

            <Link href="/compare" asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${t('compare.title')}. ${t('compare.subtitle')}`}
                onPress={tapImpact}
                style={({ pressed }) => [
                  styles.cta,
                  elevation(theme, 'card'),
                  {
                    backgroundColor: pressed ? CTA_BLUE_PRESSED : CTA_BLUE,
                    transform: [{ scale: pressed ? PRESS_SCALE : 1 }],
                  },
                ]}
              >
                <View style={styles.ctaIconBadge}>
                  <Icon name="compare" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.ctaText}>
                  <Text style={[type.h2, { color: '#FFFFFF' }]}>{t('compare.title')}</Text>
                  <Text style={[type.caption, styles.ctaSubtitle]} numberOfLines={1}>
                    {t('compare.subtitle')}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color="#FFFFFF" />
              </Pressable>
            </Link>

            {favoriteCountries.length > 0 && (
              <View style={styles.section}>
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
  listContent: { paddingHorizontal: space[4], paddingTop: space[2], paddingBottom: space[12] },
  header: { gap: space[4] },
  subtitle: { marginTop: space[1] },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    gap: space[3],
  },
  ctaIconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { flex: 1 },
  ctaSubtitle: { marginTop: 1, color: 'rgba(255,255,255,0.9)' },
  section: { gap: space[0] },
});
