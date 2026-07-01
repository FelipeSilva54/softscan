import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { HomeScreen } from '../screens/HomeScreen';
import { OtherOptionsScreen } from '../screens/OtherOptionsScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { BoletoData } from '../types/boleto.types';
import { PixData } from '../types/pix.types';

export type RootStackParamList = {
  Home: undefined;
  OtherOptions: undefined;
  Scanner: { mode: 'pix' | 'boleto' };
  Result:
    | { type: 'pix'; data: PixData }
    | { type: 'boleto'; data: BoletoData };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="OtherOptions" component={OtherOptionsScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
}
