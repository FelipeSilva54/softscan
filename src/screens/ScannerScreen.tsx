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
import { InvalidCodeSheet } from '../components/InvalidCodeSheet';
import { BackIcon } from '../icons/BackIcon';
import { CameraIllustration } from '../icons/CameraIllustration';
import { RootStackParamList } from '../navigation/AppNavigator';
import { parseBoletoBarcode } from '../parsers/boletoParser';
import { parsePixPayload } from '../parsers/pixParser';
import { colors, spacing, textStyles } from '../theme';

// O scanner de código de barras lê QUALQUER simbologia — o usuário só abre e
// aponta, sem escolher nada. Mas boleto é a prioridade e não pode ficar lento:
// por isso o tratamento é esperto (ver handleBarcodeScanned). Boleto brasileiro,
// de qualquer natureza (cobrança ou convênio/arrecadação), é sempre ITF ('itf14')
// de 44 dígitos — o que permite separá-lo dos demais formatos com segurança.
const BARCODE_TYPES: BarcodeType[] = [
  'itf14',
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code39',
  'code93',
  'code128',
  'codabar',
  'qr',
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
  const [invalidVisible, setInvalidVisible] = useState(false);
  const pendingScanRef = useRef<{ data: string; count: number } | null>(null);

  const shape = mode === 'pix' ? 'square' : 'rectangle';
  const frameSize = getFrameSize(shape, screenWidth);
  // Arredondado uma única vez aqui: tanto o recorte da máscara quanto a borda
  // (ambos desenhados no mesmo <Svg> mais abaixo) leem esses mesmos valores,
  // então não têm como divergir por arredondamento ou fonte de medida diferente.
  const holeX = Math.round((screenWidth - frameSize.width) / 2);
  const holeY = 0;
  const holeWidth = Math.round(frameSize.width);
  const holeHeight = Math.round(frameSize.height);
  const screenTitle = mode === 'pix' ? 'Escaneie o QR Code' : 'Escaneie o código de barras';
  const instruction = mode === 'pix' ? 'Aponte a câmera para o QR Code' : 'Aponte a câmera para o código de barras';

  function handleBarcodeScanned({ data, type }: BarcodeScanningResult) {
    if (scanned) return;

    // O QR Code tem correção de erro embutida: se decodificou, os dados estão
    // íntegros. Aceita de imediato (o CRC16 do Pix ainda valida o conteúdo).
    if (mode === 'pix') {
      setScanned(true);
      const pix = parsePixPayload(data);
      if (pix.isRecognized && !pix.isValid) {
        setInvalidVisible(true);
      } else if (pix.isRecognized) {
        navigation.replace('Result', { type: 'pix', data: pix });
      } else {
        navigation.replace('Result', { type: 'generic', data: { rawValue: data, barcodeType: type } });
      }
      return;
    }

    // --- Scanner de código de barras: lê tudo, mas PRIORIZA boleto ---
    // A prioridade é resolvida pela simbologia, não por um modo que o usuário
    // escolhe: boleto é sempre ITF ('itf14'), então todo ITF vai pro caminho do
    // boleto (validado por checksum) e qualquer outro formato é tratado como
    // código genérico. Assim o boleto é aceito na hora, sem os formatos de
    // varejo atrapalharem, e mesmo assim o app lê produto/QR/etc.
    if (type === 'itf14') {
      // ITF não tem verificação de comprimento embutida, então o leitor às vezes
      // devolve um PEDAÇO das barras (ex: "848..." truncado). Todo boleto tem 44
      // dígitos: descartamos leitura parcial e seguimos escaneando.
      if (data.replace(/\D/g, '').length !== 44) return;

      const boleto = parseBoletoBarcode(data);

      // Checksum válido = aceita na PRIMEIRA leitura boa. O dígito verificador
      // (módulo 10/11) detecta 100% dos erros de um dígito, então um código
      // corrompido não chega aqui — não precisamos esperar a leitura repetir.
      if (boleto.isValid) {
        setScanned(true);
        navigation.replace('Result', { type: 'boleto', data: boleto });
        return;
      }

      // Reconhecido como boleto mas o checksum não bateu. Pode ser um misread
      // pontual (uma barra borrada em UM frame). Só acusamos "inválido" depois de
      // ver o MESMO código falhar duas vezes — se no próximo frame o leitor
      // acertar, o ramo de cima aceita e o aviso nem aparece.
      const pending = pendingScanRef.current;
      const count = pending?.data === data ? pending.count + 1 : 1;
      pendingScanRef.current = { data, count };
      if (count < 2) return;

      setScanned(true);
      setInvalidVisible(true);
      return;
    }

    // QR pode carregar um Pix: se for, parseia e mostra bonitinho; senão, cai no
    // genérico (URL, texto, wi-fi etc). QR tem correção de erro, aceita direto.
    if (type === 'qr') {
      const pix = parsePixPayload(data);
      setScanned(true);
      if (pix.isRecognized && !pix.isValid) {
        setInvalidVisible(true);
      } else if (pix.isRecognized) {
        navigation.replace('Result', { type: 'pix', data: pix });
      } else {
        navigation.replace('Result', { type: 'generic', data: { rawValue: data, barcodeType: type } });
      }
      return;
    }

    // Demais formatos (produto: EAN/UPC, Code128/39/93, Codabar, PDF417...).
    // São 1D/2D sem checksum que a gente valide, então exigimos ver a MESMA
    // leitura repetir uma vez antes de aceitar — descarta um dígito trocado
    // pontual, mas continua praticamente instantâneo pra um código nítido.
    const pending = pendingScanRef.current;
    const count = pending?.data === data ? pending.count + 1 : 1;
    pendingScanRef.current = { data, count };
    if (count < 2) return;

    setScanned(true);
    navigation.replace('Result', { type: 'generic', data: { rawValue: data, barcodeType: type } });
  }

  // Código reconhecido como Pix/boleto mas com checksum inválido: a pessoa já
  // está na tela do Scanner tentando ler o código, então o aviso aparece aqui
  // mesmo (sem navegar pra Result) e "escanear novamente" só reabre a câmera
  // no lugar, sem trocar de tela.
  function handleRescan() {
    pendingScanRef.current = null;
    setInvalidVisible(false);
    setScanned(false);
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
        barcodeScannerSettings={{ barcodeTypes: mode === 'pix' ? ['qr'] : BARCODE_TYPES }}
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
          {/* holeX/holeY/holeWidth/holeHeight são calculados uma única vez, aqui,
              e usados tanto pelo recorte da máscara quanto pela borda — os dois
              são desenhados no mesmo <Svg>, então não existe uma segunda fonte
              de medida (layout/Yoga) nem um segundo arredondamento que possa
              divergir do primeiro. */}
          <Svg width={screenWidth} height={frameSize.height} style={StyleSheet.absoluteFill}>
            <Defs>
              <Mask id="scanHoleMask">
                <Rect x={0} y={0} width={screenWidth} height={frameSize.height} fill="white" />
                <Rect
                  x={holeX}
                  y={holeY}
                  width={holeWidth}
                  height={holeHeight}
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
            <ScannerFrame x={holeX} y={holeY} width={holeWidth} height={holeHeight} />
          </Svg>
        </View>

        <View style={styles.maskFill}>
          <View style={styles.instructionArea}>
            <Text style={styles.instruction}>{instruction}</Text>
            <Text style={styles.hint}>Se estiver lendo de uma tela, afaste um pouco e evite reflexo.</Text>
          </View>
        </View>
      </SafeAreaView>

      <InvalidCodeSheet visible={invalidVisible} onClose={() => navigation.goBack()} onRescan={handleRescan} />
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
