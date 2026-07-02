export type BoletoFormat = 'cobranca' | 'convenio';

export interface BoletoData {
  isValid: boolean;
  // Só chegamos a calcular o checksum quando o código tem o tamanho (44/48
  // dígitos) de um boleto de verdade. Fora isso é outro tipo de código de
  // barras, não um "boleto inválido".
  isRecognized: boolean;
  rawBarcode: string;
  format: BoletoFormat;
  bankCode?: string;
  bankName?: string;
  currencyCode?: string;
  amount?: number;
  dueDate?: Date;
  freeField?: string;
}
