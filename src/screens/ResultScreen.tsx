import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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

const PIX_KEY_TYPE_LABELS: Record<string, string> = {
  cpf: 'Chave Pix (CPF)',
  cnpj: 'Chave Pix (CNPJ)',
  email: 'Chave Pix (e-mail)',
  telefone: 'Chave Pix (telefone)',
  aleatoria: 'Chave Pix (aleatória)',
  desconhecida: 'Chave Pix',
};

export function ResultScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const { type, data } = route.params;

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
              <Value caption="Beneficiário" value={data.merchantName ?? 'Não informado'} />
              <Value caption="Cidade" value={data.merchantCity ?? 'Não informado'} />
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
          <CardButtonSmall label="Copiar código" icon="copy" onPress={() => {}} />
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
    paddingTop: 28,
    paddingBottom: spacing.xl,
  },
  title: {
    ...textStyles.heading,
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
