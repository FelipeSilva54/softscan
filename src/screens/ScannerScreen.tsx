import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFrameSize, ScannerFrame } from '../components/ScannerFrame';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { BackIcon } from '../icons/BackIcon';
import { RootStackParamList } from '../navigation/AppNavigator';
import { parseBoletoBarcode } from '../parsers/boletoParser';
import { parsePixPayload } from '../parsers/pixParser';
import { colors, spacing, textStyles } from '../theme';

export function ScannerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Scanner'>>();
  const { mode } = route.params;

  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [scanned, setScanned] = useState(false);
  const lastScanRef = useRef<string | null>(null);

  const shape = mode === 'pix' ? 'square' : 'rectangle';
  const frameSize = getFrameSize(shape);
  const instruction =
    mode === 'pix' ? 'Aponte a câmera para o QR Code do Pix' : 'Aponte a câmera para o código de barras do boleto';

  function handleBarcodeScanned({ data }: BarcodeScanningResult) {
    if (scanned || data === lastScanRef.current) return;
    lastScanRef.current = data;
    setScanned(true);

    if (mode === 'pix') {
      navigation.replace('Result', { type: 'pix', data: parsePixPayload(data) });
    } else {
      navigation.replace('Result', { type: 'boleto', data: parseBoletoBarcode(data) });
    }
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Precisamos da câmera</Text>
        <Text style={styles.permissionBody}>
          Para escanear o {mode === 'pix' ? 'QR Code' : 'código de barras'}, permita o acesso à câmera do
          aparelho.
        </Text>
        <Button
          label={permission.canAskAgain ? 'Permitir acesso' : 'Abrir configurações'}
          onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        autofocus="on"
        enableTorch={torchOn}
        barcodeScannerSettings={{ barcodeTypes: mode === 'pix' ? ['qr'] : ['itf14'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Máscara e conteúdo compartilham a mesma árvore de layout, garantindo que a mira
          fique sempre alinhada com a área central transparente. */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.maskFill}>
          <View style={styles.header}>
            <Pressable style={styles.iconButton} onPress={() => navigation.goBack()} hitSlop={8}>
              <BackIcon size={20} color={colors.white} />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={() => setTorchOn((prev) => !prev)} hitSlop={8}>
              <Icon name="flash" size={22} color={torchOn ? colors.primary : colors.white} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.maskMiddleRow, { height: frameSize.height }]}>
          <View style={styles.maskFill} />
          <View style={{ width: frameSize.width }}>
            <ScannerFrame shape={shape} />
          </View>
          <View style={styles.maskFill} />
        </View>

        <View style={styles.maskFill}>
          <View style={styles.instructionArea}>
            <Text style={styles.instruction}>{instruction}</Text>
            <Text style={styles.hint}>Se estiver lendo de uma tela, afaste um pouco e evite reflexo.</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const OVERLAY_COLOR = 'rgba(0,0,0,0.55)';

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    gap: spacing.md,
  },
  permissionTitle: {
    ...textStyles.title,
    color: colors.secondary,
  },
  permissionBody: {
    ...textStyles.body,
    color: colors.gray,
    marginBottom: spacing.md,
  },
  container: {
    flex: 1,
    backgroundColor: colors.text,
  },
  maskFill: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
  },
  maskMiddleRow: {
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionArea: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  instruction: {
    ...textStyles.subtitle,
    color: colors.white,
    textAlign: 'center',
  },
  hint: {
    ...textStyles.body,
    color: colors.white,
    opacity: 0.7,
    textAlign: 'center',
  },
});
