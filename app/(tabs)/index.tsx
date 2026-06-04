import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CountryListItem } from '@/components/CountryListItem';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { COUNTRIES } from '@/lib/countries';
import { useTheme } from '@/lib/theme';

export default function CountriesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg.canvas }]} edges={['bottom']}>
      <FlatList
        data={COUNTRIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text.primary }]}>{t('home.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              {t('home.subtitle')}
            </Text>
            <LanguageSwitcher />

            <Link href="/compare" asChild>
              <Pressable
                accessibilityRole="link"
                style={({ pressed }) => [
                  styles.cta,
                  { backgroundColor: pressed ? theme.brand.primaryPressed : theme.brand.primary },
                ]}
              >
                <Text style={styles.ctaIcon}>📊</Text>
                <View style={styles.ctaText}>
                  <Text style={[styles.ctaTitle, { color: theme.brand.onPrimary }]}>
                    {t('compare.title')}
                  </Text>
                  <Text style={[styles.ctaSubtitle, { color: theme.brand.onPrimary }]}>
                    {t('compare.subtitle')}
                  </Text>
                </View>
                <Text style={[styles.ctaChevron, { color: theme.brand.onPrimary }]}>›</Text>
              </Pressable>
            </Link>

            <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>
              {t('tabs.countries')}
            </Text>
          </View>
        }
        renderItem={({ item }) => <CountryListItem country={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16 },
  header: { marginBottom: 4, gap: 14 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { marginTop: -8, fontSize: 15 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  ctaIcon: { fontSize: 26 },
  ctaText: { flex: 1 },
  ctaTitle: { fontSize: 16, fontWeight: '800' },
  ctaSubtitle: { fontSize: 13, marginTop: 2, opacity: 0.9 },
  ctaChevron: { fontSize: 24, fontWeight: '300' },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
});
