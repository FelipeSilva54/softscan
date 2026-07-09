import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Image, Platform, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, textStyles } from '../theme';

const PIX_DONATION_KEY = 'fe8e68dc-fc29-483d-ad38-0d9bd4d84221';

async function copyPixKey() {
  await Clipboard.setStringAsync(PIX_DONATION_KEY);
  if (Platform.OS === 'android') {
    ToastAndroid.show('Código pix copiado', ToastAndroid.SHORT);
  }
}

export function DonateScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safe}>
      <Header onBackPress={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.body}>
          <Image
            source={require('../../assets/Donate-image.png')}
            style={styles.image}
            resizeMode="contain"
            fadeDuration={0}
          />
          <Text style={styles.title}>Apoie o SoftScan 💙</Text>
          <Text style={styles.description}>
            Este app é 100% gratuito e sem anúncios. Se ele é útil para você, considere fazer uma
            doação de qualquer valor para ajudar a manter o projeto funcionando e continuar
            recebendo melhorias.
          </Text>
        </View>
        <Button label="Copiar código Pix" onPress={copyPixKey} style={styles.button} />
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
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 260,
  },
  title: {
    ...textStyles.subheading,
    color: colors.secondary,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  description: {
    ...textStyles.body,
    color: colors.gray,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  button: {
    marginBottom: spacing.md,
  },
});
