import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SoftscanLogo } from '../icons/SoftscanLogo';
import { RootStackParamList } from '../navigation/AppNavigator';
import { setHasOnboarded } from '../storage/onboardingStorage';
import { setUserName } from '../storage/userStorage';
import { colors, spacing, textStyles } from '../theme';

export function NameScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');

  async function handleSubmit() {
    await setUserName(name.trim());
    await setHasOnboarded();
    navigation.reset({ index: 0, routes: [{ name: 'Loading' }] });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.top}>
          <SoftscanLogo />
          <View style={styles.heading}>
            <Text style={styles.titleSecondary}>Antes de começarmos,</Text>
            <Text style={styles.titlePrimary}>Como você se chama?</Text>
          </View>
          <Text style={styles.subtitle}>Digite somente o primeiro nome.</Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Ex: Lucas"
            autoCapitalize="words"
            style={styles.input}
          />
        </View>
        <Button
          label="Começar"
          onPress={handleSubmit}
          disabled={!name.trim()}
          style={styles.button}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  top: {
    paddingTop: spacing.xl,
  },
  heading: {
    marginTop: 100,
  },
  titleSecondary: {
    ...textStyles.heading,
    color: colors.secondary,
  },
  titlePrimary: {
    ...textStyles.heading,
    color: colors.primary,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.gray,
    marginTop: spacing.sm,
  },
  input: {
    marginTop: 64,
  },
  button: {
    marginBottom: 16,
  },
});
