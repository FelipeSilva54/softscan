import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardButtonHorizontal } from '../components/CardButtonHorizontal';
import { Header } from '../components/Header';
import { Pill } from '../components/Pill';
import { SearchBar } from '../components/SearchBar';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getAllScans } from '../storage/historyStorage';
import { colors, spacing, textStyles } from '../theme';
import { HistoryRecord } from '../types/history.types';

type FilterKey = 'all' | 'qrcode' | 'barcode';

const WEEKDAYS = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
const MONTHS = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
];

interface Section {
  key: string;
  title: string;
  records: HistoryRecord[];
}

function isQrRecord(record: HistoryRecord): boolean {
  if (record.type === 'pix') return true;
  if (record.type === 'boleto') return false;
  return record.data.barcodeType === 'qr';
}

function dayKey(scannedAt: string): string {
  return scannedAt.slice(0, 10);
}

function formatSectionTitle(key: string): string {
  const date = new Date(`${key}T00:00:00`);
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} DE ${MONTHS[date.getMonth()]}`;
}

function groupByDate(records: HistoryRecord[]): Section[] {
  const map = new Map<string, HistoryRecord[]>();
  for (const record of records) {
    const key = dayKey(record.scannedAt);
    const group = map.get(key) ?? [];
    group.push(record);
    map.set(key, group);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, groupRecords]) => ({ key, title: formatSectionTitle(key), records: groupRecords }));
}

export function HistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [scans, setScans] = useState<HistoryRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  useFocusEffect(
    useCallback(() => {
      getAllScans().then(setScans);
    }, [])
  );

  const sections = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = scans.filter((record) => {
      if (filter === 'qrcode' && !isQrRecord(record)) return false;
      if (filter === 'barcode' && isQrRecord(record)) return false;
      if (query && !record.name.toLowerCase().includes(query)) return false;
      return true;
    });
    return groupByDate(filtered);
  }, [scans, search, filter]);

  return (
    <SafeAreaView style={styles.safe}>
      <Header onBackPress={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Histórico</Text>
        <SearchBar value={search} onChangeText={setSearch} style={styles.searchBar} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillsScroll}
          contentContainerStyle={styles.pills}
        >
          <Pill label="Todos" active={filter === 'all'} onPress={() => setFilter('all')} />
          <Pill
            label="Código de barras"
            active={filter === 'barcode'}
            onPress={() => setFilter('barcode')}
          />
          <Pill label="QR Code" active={filter === 'qrcode'} onPress={() => setFilter('qrcode')} />
        </ScrollView>
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {sections.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
          ) : (
            sections.map((section) => (
              <View key={section.key} style={styles.group}>
                <Text style={styles.groupLabel}>{section.title}</Text>
                <View style={styles.groupItems}>
                  {section.records.map((record) => (
                    <CardButtonHorizontal
                      key={record.id}
                      label={record.name}
                      icon={isQrRecord(record) ? 'qrcode' : 'barcode'}
                      onPress={() => navigation.navigate('Result', { ...record })}
                    />
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 28,
  },
  title: {
    ...textStyles.heading,
    color: colors.secondary,
  },
  searchBar: {
    marginTop: spacing.xl,
  },
  pillsScroll: {
    marginTop: spacing.xl,
    marginHorizontal: -spacing.lg,
    flexGrow: 0,
  },
  pills: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  listScroll: {
    flex: 1,
    marginTop: spacing.xl,
  },
  list: {
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },
  group: {
    gap: spacing.md,
  },
  groupLabel: {
    ...textStyles.caption,
    color: colors.gray,
  },
  groupItems: {
    gap: spacing.md,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
