import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '../components/AppLogo';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, textStyles } from '../theme';

const REDIRECT_DELAY = 1800;

export function LoadingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();

    const timeout = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }, REDIRECT_DELAY);

    return () => {
      spin.stop();
      clearTimeout(timeout);
    };
  }, [navigation, spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Animated.View style={[styles.logo, { transform: [{ rotate }] }]}>
          <AppLogo size={40} />
        </Animated.View>
        <Text style={styles.title}>Preparando tudo…</Text>
        <Text style={styles.subtitle}>Aguarde alguns segundos</Text>
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
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: 36,
  },
  logo: {
    alignSelf: 'flex-start',
  },
  title: {
    ...textStyles.heading,
    color: colors.secondary,
    marginTop: 28,
  },
  subtitle: {
    ...textStyles.subtitle,
    color: colors.gray,
    marginTop: spacing.xxs,
  },
});
