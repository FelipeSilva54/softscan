import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Share, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardButtonSmall } from '../components/CardButtonSmall';
import { Header } from '../components/Header';
import { InvalidCodeSheet } from '../components/InvalidCodeSheet';
import { SaveResultSheet } from '../components/SaveResultSheet';
import { Value } from '../components/Value';
import { RootStackParamList } from '../navigation/AppNavigator';
import { isWebLink } from '../parsers/linkParser';
import { removeScan, saveScan, updateScanName } from '../storage/historyStorage';
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
  // O toast nativo do Android 13+ para acesso à área de transferência não é
  // garantido: fabricantes como Xiaomi (MIUI) o suprimem mesmo em versões
  // recentes. Por isso sempre mostramos o nosso, mesmo arriscando duplicar
  // em Android "puro" — melhor que copiar sem nenhum feedback visual.
  if (Platform.OS === 'android') {
    ToastAndroid.show('Código copiado', ToastAndroid.SHORT);
  }
}

async function shareCode(value: string) {
  await Share.share({ message: value });
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
  const [name, setName] = useState(route.params.name);
  const [recordId, setRecordId] = useState(route.params.id);
  const [isSaveSheetVisible, setSaveSheetVisible] = useState(false);
  const isSaved = !!recordId;

  async function handleSaveName(newName: string) {
    if (recordId) {
      await updateScanName(recordId, newName);
      setName(newName);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Nome atualizado', ToastAndroid.SHORT);
      }
      return;
    }

    const saved = await saveScan({ ...route.params, name: newName });
    setRecordId(saved.id);
    setName(newName);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Resultado salvo no histórico', ToastAndroid.SHORT);
    }
  }

  function handleRemove() {
    if (!recordId) return;

    Alert.alert(
      'Remover resultado',
      'Esse resultado será removido do histórico e não poderá ser recuperado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await removeScan(recordId);
            navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'History' }] });
            if (Platform.OS === 'android') {
              ToastAndroid.show('Resultado removido', ToastAndroid.SHORT);
            }
          },
        },
      ]
    );
  }

  if (type === 'generic') {
    const isLink = isWebLink(data.rawValue);

    return (
      <SafeAreaView style={styles.safe}>
        <Header onBackPress={() => navigation.popToTop()} />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{name ?? BARCODE_TYPE_LABELS[data.barcodeType] ?? 'Código lido'}</Text>
          <View style={styles.data}>
            <Value caption="Conteúdo" value={data.rawValue} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.actionsScroll}
            contentContainerStyle={styles.actions}
          >
            {isLink ? (
              <CardButtonSmall
                label="Abrir link"
                icon="open-link"
                onPress={() => Linking.openURL(data.rawValue)}
              />
            ) : (
              <CardButtonSmall label="Copiar código" icon="copy" onPress={() => copyToClipboard(data.rawValue)} />
            )}
            <CardButtonSmall label="Compartilhar" icon="share" onPress={() => shareCode(data.rawValue)} />
            {isSaved ? (
              <>
                <CardButtonSmall label="Editar nome" icon="edit" onPress={() => setSaveSheetVisible(true)} />
                <CardButtonSmall
                  label="Remover"
                  icon="save-remove"
                  iconColor={colors.error}
                  onPress={handleRemove}
                />
              </>
            ) : (
              <CardButtonSmall label="Salvar" icon="save" onPress={() => setSaveSheetVisible(true)} />
            )}
          </ScrollView>
        </ScrollView>
        <SaveResultSheet
          visible={isSaveSheetVisible}
          onClose={() => setSaveSheetVisible(false)}
          onSave={handleSaveName}
          initialName={name}
        />
      </SafeAreaView>
    );
  }

  if (!data.isValid) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBackPress={() => navigation.popToTop()} />
        <InvalidCodeSheet
          visible
          onClose={() => navigation.popToTop()}
          onRescan={() => navigation.replace('Scanner', { mode: type })}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header onBackPress={() => navigation.popToTop()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{name ?? (type === 'pix' ? 'Dados do Pix' : 'Dados do boleto')}</Text>
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
              <Value caption="Linha digitável" value={data.linhaDigitavel ?? data.rawBarcode} />
              <Value caption="Código de barras" value={data.rawBarcode} />
            </>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.actionsScroll}
          contentContainerStyle={styles.actions}
        >
          <CardButtonSmall
            label="Copiar código"
            icon="copy"
            onPress={() =>
              copyToClipboard(type === 'pix' ? data.rawPayload : data.linhaDigitavel ?? data.rawBarcode)
            }
          />
          <CardButtonSmall
            label="Compartilhar"
            icon="share"
            onPress={() => shareCode(type === 'pix' ? data.rawPayload : data.linhaDigitavel ?? data.rawBarcode)}
          />
          {isSaved ? (
            <>
              <CardButtonSmall label="Editar nome" icon="edit" onPress={() => setSaveSheetVisible(true)} />
              <CardButtonSmall label="Remover" icon="save-remove" iconColor={colors.error} onPress={handleRemove} />
            </>
          ) : (
            <CardButtonSmall label="Salvar" icon="save" onPress={() => setSaveSheetVisible(true)} />
          )}
        </ScrollView>
      </ScrollView>
      <SaveResultSheet
        visible={isSaveSheetVisible}
        onClose={() => setSaveSheetVisible(false)}
        onSave={handleSaveName}
        initialName={name}
        placeholder={type === 'pix' ? 'Ex: Pix da Sofia' : 'Ex: Boleto da Enel'}
      />
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
  actionsScroll: {
    marginTop: 48,
    marginHorizontal: -spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  notice: {
    ...textStyles.body,
    color: colors.gray,
  },
});
