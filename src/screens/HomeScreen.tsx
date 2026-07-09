import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '../components/AppLogo';
import { CardButton } from '../components/CardButton';
import { CardButtonHorizontal } from '../components/CardButtonHorizontal';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getUserName } from '../storage/userStorage';
import { colors, spacing, textStyles } from '../theme';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [userName, setUserName] = useState<string | null>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      getUserName().then(setUserName);

      spinAnim.setValue(0);
      const spin = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spin.start();

      return () => spin.stop();
    }, [spinAnim])
  );

  const greeting = userName ? `Olá, ${userName}!` : 'Olá!';

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safe}>
<View style={styles.content}>
        <View style={styles.heading}>
          <Animated.View style={[styles.logo, { transform: [{ rotate }] }]}>
            <AppLogo size={40} />
          </Animated.View>
          <Text style={styles.headingPrimary}>{greeting}</Text>
          <Text style={styles.headingSecondary}>O que deseja escanear?</Text>
          <Text style={styles.subtitle}>Clique nos cards abaixo para usar os serviços.</Text>
        </View>
        <View style={styles.row}>
          <CardButton
            label="Código de Barras"
            icon="barcode"
            onPress={() => navigation.navigate('Scanner', { mode: 'boleto' })}
          />
          <CardButton
            label="QR Code"
            icon="qrcode"
            onPress={() => navigation.navigate('Scanner', { mode: 'pix' })}
          />
        </View>
        <CardButtonHorizontal
          style={styles.otherOptions}
          label="Outras opções"
          icon="menu"
          onPress={() => navigation.navigate('OtherOptions')}
        />
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
    paddingTop: 134,
  },
  heading: {
    marginBottom: 40,
  },
  logo: {
    alignSelf: 'flex-start',
  },
  headingPrimary: {
    ...textStyles.heading,
    color: colors.primary,
    marginTop: spacing.lg,
  },
  headingSecondary: {
    ...textStyles.heading,
    color: colors.secondary,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.gray,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  otherOptions: {
    marginTop: spacing.md,
  },
});
