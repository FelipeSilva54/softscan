import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_ONBOARDED_KEY = '@softscan:hasOnboarded';

export async function getHasOnboarded(): Promise<boolean> {
  const value = await AsyncStorage.getItem(HAS_ONBOARDED_KEY);
  return value === 'true';
}

export async function setHasOnboarded(): Promise<void> {
  await AsyncStorage.setItem(HAS_ONBOARDED_KEY, 'true');
}
