import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CountryListItem } from '@/components/CountryListItem';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { COUNTRIES } from '@/lib/countries';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: t('home.title') }} />
      <FlatList
        data={COUNTRIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.titleBlock}>
                <Text style={styles.title}>{t('home.title')}</Text>
                <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
              </View>
            </View>
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleBlock: {
    flex: 1,
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
