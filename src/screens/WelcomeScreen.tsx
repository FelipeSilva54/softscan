import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppLogo } from '../components/AppLogo';
import { Button } from '../components/Button';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, textStyles } from '../theme';

export function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  function handleContinue() {
    navigation.navigate('Name');
  }

  return (
    <View style={styles.safe}>
      <View style={styles.imagePlaceholder} />
      <View style={[styles.card, { paddingBottom: spacing.lg + insets.bottom }]}>
        <AppLogo size={48} />
        <Text style={styles.title}>Olá, seja bem-vindo{'\n'}ao Softscan</Text>
        <Text style={styles.subtitle}>
          Escaneie, valide e copie boletos e QR Codes Pix.
        </Text>
        <Button label="Vamos lá" onPress={handleContinue} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imagePlaceholder: {
    height: '55%',
    backgroundColor: colors.primary,
  },
  card: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 36,
  },
  title: {
    ...textStyles.heading,
    color: colors.secondary,
    marginTop: spacing.lg,
  },
  subtitle: {
    ...textStyles.subtitle,
    color: colors.gray,
    marginTop: spacing.sm,
  },
  button: {
    marginTop: 40,
  },
});
