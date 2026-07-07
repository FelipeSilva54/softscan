export type BoletoFormat = 'cobranca' | 'convenio';

export interface BoletoData {
  isValid: boolean;
  // Só chegamos a calcular o checksum quando o código tem o tamanho (44/48
  // dígitos) de um boleto de verdade. Fora isso é outro tipo de código de
  // barras, não um "boleto inválido".
  isRecognized: boolean;
  rawBarcode: string;
  // Formato que o banco espera ao colar/digitar o boleto pra pagamento manual
  // (o código de barras cru não é aceito do mesmo jeito). Só existe quando
  // isRecognized é true — o cálculo depende do código já estar no formato certo.
  linhaDigitavel?: string;
  format: BoletoFormat;
  bankCode?: string;
  bankName?: string;
  // Segmento de arrecadação (só convênio): identifica o tipo de conta pela 2ª
  // posição do código — energia, telecom, saneamento etc. É o equivalente do
  // "banco" para convênio, que não carrega código de instituição.
  segment?: string;
  currencyCode?: string;
  amount?: number;
  dueDate?: Date;
  freeField?: string;
}
