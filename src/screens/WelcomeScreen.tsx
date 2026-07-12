import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { SoftscanWordmark } from '../components/SoftscanWordmark';
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
      <Image
        source={require('../../assets/welcome-img.webp')}
        style={styles.background}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[colors.scrimSoft, colors.transparent]}
        style={styles.topScrim}
      />
      <LinearGradient
        colors={[colors.transparent, colors.scrimSoft, colors.scrimStrong]}
        locations={[0, 0.4, 1]}
        style={styles.bottomScrim}
      />
      <View style={styles.content}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <SoftscanWordmark width={100} />
        </View>
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Text style={styles.title}>Escaneie boletos e QR Codes com facilidade</Text>
          <Text style={styles.subtitle}>
            Leia boletos, códigos de barras e QR Codes PIX em segundos, de forma rápida e gratuita.
          </Text>
          <Button label="Vamos lá" onPress={handleContinue} style={styles.button} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  bottomScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '52%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...textStyles.heading,
    color: colors.white,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.background,
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.xl,
  },
});
