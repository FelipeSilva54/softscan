import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { CardButtonSmall } from '../components/CardButtonSmall';
import { Header } from '../components/Header';
import { Value } from '../components/Value';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, textStyles } from '../theme';

function formatCurrency(amount?: number): string {
  if (amount === undefined) return 'Valor não definido';
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(date?: Date): string {
  if (!date) return 'Não informado';
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

async function copyToClipboard(value: string) {
  await Clipboard.setStringAsync(value);
  // Android 13+ (API 33) já mostra o toast nativo "Copiado para a área de transferência"
  // ao chamar o clipboard — um toast próprio aqui duplicaria a mensagem na tela.
  if (Platform.OS === 'android' && Platform.Version < 33) {
    ToastAndroid.show('Código copiado', ToastAndroid.SHORT);
  }
}

const PIX_KEY_TYPE_LABELS: Record<string, string> = {
  cpf: 'Chave Pix (CPF)',
  cnpj: 'Chave Pix (CNPJ)',
  email: 'Chave Pix (e-mail)',
  telefone: 'Chave Pix (telefone)',
  aleatoria: 'Chave Pix (aleatória)',
  desconhecida: 'Chave Pix',
};

const BARCODE_TYPE_LABELS: Record<string, string> = {
  qr: 'QR Code',
  itf14: 'Código de barras (ITF)',
  code128: 'Código de barras (Code 128)',
  code39: 'Código de barras (Code 39)',
  code93: 'Código de barras (Code 93)',
  codabar: 'Código de barras (Codabar)',
  ean13: 'Código de barras (EAN-13)',
  ean8: 'Código de barras (EAN-8)',
  upc_a: 'Código de barras (UPC-A)',
  upc_e: 'Código de barras (UPC-E)',
  pdf417: 'Código de barras (PDF417)',
  datamatrix: 'Código de barras (Data Matrix)',
  aztec: 'Código de barras (Aztec)',
};

export function ResultScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const { type, data } = route.params;

  if (type === 'generic') {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBackPress={() => navigation.popToTop()} />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{BARCODE_TYPE_LABELS[data.barcodeType] ?? 'Código lido'}</Text>
          <View style={styles.data}>
            <Value caption="Conteúdo" value={data.rawValue} />
          </View>
          <View style={styles.actions}>
            <CardButtonSmall label="Copiar código" icon="copy" onPress={() => copyToClipboard(data.rawValue)} />
            <CardButtonSmall label="Compartilhar" icon="share" onPress={() => {}} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!data.isValid) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBackPress={() => navigation.popToTop()} />
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Código inválido</Text>
          <Text style={styles.errorBody}>
            Não conseguimos confirmar que este código é válido. Tente escanear novamente.
          </Text>
          <Button label="Escanear novamente" onPress={() => navigation.replace('Scanner', { mode: type })} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header onBackPress={() => navigation.popToTop()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{type === 'pix' ? 'Dados do Pix' : 'Dados do boleto'}</Text>
        <View style={styles.data}>
          {type === 'pix' ? (
            <>
              <Value caption="Valor" value={formatCurrency(data.amount)} />
              <Value caption="Nome" value={data.merchantName ?? 'Não informado'} />
              <Value
                caption={PIX_KEY_TYPE_LABELS[data.pixKeyType ?? 'desconhecida']}
                value={data.pixKey ?? 'Não disponível'}
              />
              {data.txid && <Value caption="Identificador (txid)" value={data.txid} />}
              {data.isDynamic && !data.pixKey && (
                <Text style={styles.notice}>
                  QR dinâmico — verifique o valor final no app do seu banco antes de pagar.
                </Text>
              )}
            </>
          ) : (
            <>
              <Value caption="Valor" value={formatCurrency(data.amount)} />
              <Value caption="Vencimento" value={formatDate(data.dueDate)} />
              <Value caption="Instituição" value={data.bankName ?? `Banco ${data.bankCode ?? ''}`} />
              <Value caption="Código de barras" value={data.rawBarcode} />
            </>
          )}
        </View>
        <View style={styles.actions}>
          <CardButtonSmall
            label="Copiar código"
            icon="copy"
            onPress={() => copyToClipboard(type === 'pix' ? data.rawPayload : data.rawBarcode)}
          />
          <CardButtonSmall label="Compartilhar" icon="share" onPress={() => {}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    paddingBottom: spacing.xl,
  },
  title: {
    ...textStyles.subheading,
    color: colors.secondary,
  },
  data: {
    marginTop: 40,
    gap: 28,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 48,
    gap: spacing.md,
  },
  errorContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    gap: spacing.md,
  },
  errorTitle: {
    ...textStyles.title,
    color: colors.error,
  },
  errorBody: {
    ...textStyles.body,
    color: colors.gray,
    marginBottom: spacing.md,
  },
  notice: {
    ...textStyles.body,
    color: colors.gray,
  },
});
