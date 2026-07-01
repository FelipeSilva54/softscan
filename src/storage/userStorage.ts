import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_NAME_KEY = '@softscan:userName';

export async function getUserName(): Promise<string | null> {
  return AsyncStorage.getItem(USER_NAME_KEY);
}

export async function setUserName(name: string): Promise<void> {
  await AsyncStorage.setItem(USER_NAME_KEY, name);
}
