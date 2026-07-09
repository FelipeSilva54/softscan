import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryRecord, NewHistoryRecord } from '../types/history.types';

const HISTORY_KEY = '@softscan:history';
// Evita que o histórico cresça sem limite (cada leitura/gravação relê e
// reescreve a lista inteira do AsyncStorage) — mantém as mais recentes.
const MAX_HISTORY_ITEMS = 200;

export async function getAllScans(): Promise<HistoryRecord[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];

  const records: HistoryRecord[] = JSON.parse(raw);
  // dueDate do boleto vira string no JSON — precisa voltar a ser Date.
  return records.map((record) =>
    record.type === 'boleto' && record.data.dueDate
      ? { ...record, data: { ...record.data, dueDate: new Date(record.data.dueDate) } }
      : record
  );
}

export async function saveScan(record: NewHistoryRecord): Promise<HistoryRecord> {
  const scans = await getAllScans();
  const newRecord: HistoryRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    scannedAt: new Date().toISOString(),
  };

  const updated = [newRecord, ...scans].slice(0, MAX_HISTORY_ITEMS);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return newRecord;
}

export async function updateScanName(id: string, name: string): Promise<void> {
  const scans = await getAllScans();
  const updated = scans.map((scan) => (scan.id === id ? { ...scan, name } : scan));
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export async function removeScan(id: string): Promise<void> {
  const scans = await getAllScans();
  const filtered = scans.filter((scan) => scan.id !== id);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}
