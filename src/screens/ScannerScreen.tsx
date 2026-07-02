import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BarcodeScanningResult, BarcodeType, CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Defs, Mask, Rect, Svg } from 'react-native-svg';
import { FRAME_RADIUS, getFrameSize, ScannerFrame } from '../components/ScannerFrame';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { BackIcon } from '../icons/BackIcon';
import { CameraIllustration } from '../icons/CameraIllustration';
import { RootStackParamList } from '../navigation/AppNavigator';
import { parseBoletoBarcode } from '../parsers/boletoParser';
import { parsePixPayload } from '../parsers/pixParser';
import { colors, spacing, textStyles } from '../theme';

// Modo "boleto" (card "Código de Barras" da Home) não fica restrito ao
// ITF-14: lê qualquer formato 1D/2D não-QR suportado pela lib, e o parser
// de boleto decide se o conteúdo lido é um boleto de verdade ou não.
const NON_QR_BARCODE_TYPES: BarcodeType[] = [
  'itf14',
  'code128',
  'code39',
  'code93',
  'codabar',
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'pdf417',
  'datamatrix',
  'aztec',
];

export function ScannerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Scanner'>>();
  const { mode } = route.params;

  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [scanned, setScanned] = useState(false);
  const pendingScanRef = useRef<{ data: string; count: number } | null>(null);

  const shape = mode === 'pix' ? 'square' : 'rectangle';
  const frameSize = getFrameSize(shape, screenWidth);
  const screenTitle = mode === 'pix' ? 'Escaneie o QR Code' : 'Escaneie o código de barras';
  const instruction = mode === 'pix' ? 'Aponte a câmera para o QR Code' : 'Aponte a câmera para o código de barras';

  // Código de barras 1D (boleto e afins) não tem correção de erro embutida como
  // o QR Code: uma única leitura com desfoque pode decodificar um dígito errado.
  // Só aceitamos a leitura depois de vê-la repetir em frames consecutivos, o que
  // descarta a maior parte dos falsos "inválido".
  const CONFIRMATIONS_NEEDED = mode === 'pix' ? 1 : 2;

  function handleBarcodeScanned({ data, type }: BarcodeScanningResult) {
    if (scanned) return;

    const pending = pendingScanRef.current;
    const count = pending?.data === data ? pending.count + 1 : 1;
    pendingScanRef.current = { data, count };

    if (count < CONFIRMATIONS_NEEDED) return;

    setScanned(true);

    if (mode === 'pix') {
      const pix = parsePixPayload(data);
      if (pix.isRecognized) {
        navigation.replace('Result', { type: 'pix', data: pix });
      } else {
        navigation.replace('Result', { type: 'generic', data: { rawValue: data, barcodeType: type } });
      }
    } else {
      const boleto = parseBoletoBarcode(data);
      if (boleto.isRecognized) {
        navigation.replace('Result', { type: 'boleto', data: boleto });
      } else {
        navigation.replace('Result', { type: 'generic', data: { rawValue: data, barcodeType: type } });
      }
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
    // No Android, antes da 1ª solicitação `canAskAgain` já vem `false`
    // (indistinguível de "negado permanentemente"), então só confiamos
    // nele depois que o usuário realmente negou o pedido (status "denied").
    const canRequest = permission.status !== 'denied' || permission.canAskAgain;

    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <CameraIllustration width={260} height={260 * (275 / 298)} />
          <Text style={styles.permissionTitle}>Permita o acesso à câmera</Text>
          <Text style={styles.permissionBody}>
            Autorize o acesso à câmera para escanear códigos de barras e QR Codes
          </Text>
        </View>
        <Button
          label={canRequest ? 'Permitir acesso' : 'Abrir configurações'}
          onPress={() => (canRequest ? requestPermission() : Linking.openSettings())}
          style={[styles.permissionButton, { bottom: 16 + insets.bottom }]}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        // Contra-intuitivo: no expo-camera, autofocus="on" foca uma única vez e
        // TRAVA o foco (bom pra foto, péssimo pro scanner — o usuário aproxima/
        // afasta/inclina o celular o tempo todo). "off" é o que mantém a câmera
        // refocando continuamente em ambas as plataformas (no Android já é o
        // comportamento padrão do preview; no iOS mapeia para
        // .continuousAutoFocus). Ver expo-camera/ios/Current/CameraEnums.swift.
        autofocus="off"
        enableTorch={torchOn}
        barcodeScannerSettings={{ barcodeTypes: mode === 'pix' ? ['qr'] : NON_QR_BARCODE_TYPES }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Máscara e conteúdo compartilham a mesma árvore de layout, garantindo que a mira
          fique sempre alinhada com a área central transparente. edges exclui o topo de
          propósito: o fundo escuro precisa se estender por trás da status bar, só o
          conteúdo (botões/título) é que respeita o inset. */}
      <SafeAreaView style={styles.overlay} edges={['left', 'right', 'bottom']} pointerEvents="box-none">
        <View style={styles.maskFill}>
          <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
            <Pressable style={styles.iconButton} onPress={() => navigation.goBack()} hitSlop={8}>
              <BackIcon size={20} color={colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>{screenTitle}</Text>
            <Pressable style={styles.iconButton} onPress={() => setTorchOn((prev) => !prev)} hitSlop={8}>
              <Icon name="flash" size={22} color={torchOn ? colors.primary : colors.white} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.maskMiddleRow, { height: frameSize.height }]}>
          <Svg width={screenWidth} height={frameSize.height} style={StyleSheet.absoluteFill}>
            <Defs>
              <Mask id="scanHoleMask">
                <Rect x={0} y={0} width={screenWidth} height={frameSize.height} fill="white" />
                <Rect
                  x={(screenWidth - frameSize.width) / 2}
                  y={0}
                  width={frameSize.width}
                  height={frameSize.height}
                  rx={FRAME_RADIUS}
                  ry={FRAME_RADIUS}
                  fill="black"
                />
              </Mask>
            </Defs>
            <Rect
              x={0}
              y={0}
              width={screenWidth}
              height={frameSize.height}
              fill={OVERLAY_COLOR}
              mask="url(#scanHoleMask)"
            />
          </Svg>
          <View style={{ width: frameSize.width }}>
            <ScannerFrame shape={shape} screenWidth={screenWidth} />
          </View>
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
  },
  permissionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: {
    ...textStyles.subheading,
    color: colors.secondary,
    textAlign: 'center',
    marginTop: 24,
  },
  permissionBody: {
    ...textStyles.body,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  permissionButton: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    ...textStyles.subtitle,
    color: colors.white,
    textAlign: 'center',
    includeFontPadding: false,
    flex: 1,
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
