import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { HomeScreen } from '../screens/HomeScreen';
import { OtherOptionsScreen } from '../screens/OtherOptionsScreen';

export type RootStackParamList = {
  Home: undefined;
  OtherOptions: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="OtherOptions" component={OtherOptionsScreen} />
    </Stack.Navigator>
  );
}
