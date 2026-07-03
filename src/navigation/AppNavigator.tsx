import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import { NameScreen } from '../screens/NameScreen';
import { OtherOptionsScreen } from '../screens/OtherOptionsScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { getHasOnboarded } from '../storage/onboardingStorage';
import { colors } from '../theme';
import { BoletoData } from '../types/boleto.types';
import { GenericScanData } from '../types/generic.types';
import { PixData } from '../types/pix.types';

export type RootStackParamList = {
  Welcome: undefined;
  Name: undefined;
  Loading: undefined;
  Home: undefined;
  OtherOptions: undefined;
  History: undefined;
  Scanner: { mode: 'pix' | 'boleto' };
  Result:
    | { type: 'pix'; data: PixData; name?: string; id?: string; scannedAt?: string }
    | { type: 'boleto'; data: BoletoData; name?: string; id?: string; scannedAt?: string }
    | { type: 'generic'; data: GenericScanData; name?: string; id?: string; scannedAt?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    getHasOnboarded().then((hasOnboarded) => setInitialRoute(hasOnboarded ? 'Loading' : 'Welcome'));
  }, []);

  if (!initialRoute) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="OtherOptions" component={OtherOptionsScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
}
