import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CountryListItem } from '@/components/CountryListItem';
import { COUNTRIES, type Country } from '@/lib/countries';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleSelect = (country: Country) => {
    router.push(`/country/${country.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: t('home.title') }} />
      <FlatList
        data={COUNTRIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{t('home.title')}</Text>
            <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <CountryListItem country={item} onPress={handleSelect} />
        )}
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
