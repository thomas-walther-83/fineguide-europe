import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CountryListItem } from '@/components/CountryListItem';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { COUNTRIES } from '@/lib/countries';

export default function CountriesScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={COUNTRIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{t('home.title')}</Text>
            <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
            <LanguageSwitcher />
          </View>
        }
        renderItem={({ item }) => <CountryListItem country={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f3f5',
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#11181C',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#687076',
  },
});
