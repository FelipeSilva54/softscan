export type BoletoFormat = 'cobranca' | 'convenio';

export interface BoletoData {
  isValid: boolean;
  rawBarcode: string;
  format: BoletoFormat;
  bankCode?: string;
  bankName?: string;
  currencyCode?: string;
  amount?: number;
  dueDate?: Date;
  freeField?: string;
}
