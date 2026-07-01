import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardButton } from '../components/CardButton';
import { colors, spacing, textStyles } from '../theme';

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headingPrimary}>Olá Lucas!</Text>
          <Text style={styles.headingSecondary}>O que vai escanear?</Text>
          <Text style={styles.subtitle}>Clique nos cards abaixo para usar os serviços</Text>
        </View>
        <View style={styles.row}>
          <CardButton
            label="Código de Barras"
            icon="barcode"
            onPress={() => {}}
          />
          <CardButton
            label="QR Code"
            icon="qrcode"
            onPress={() => {}}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 140,
  },
  header: {
    marginBottom: 40,
  },
  headingPrimary: {
    ...textStyles.heading,
    color: colors.primary,
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
});
