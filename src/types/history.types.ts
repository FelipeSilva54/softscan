export type ScanType = 'pix' | 'boleto';

export interface ScanRecord {
  id: string;
  type: ScanType;
  rawCode: string;
  scannedAt: string;
  isValid: boolean;
  // PIX
  pixKey?: string;
  merchantName?: string;
  amount?: number;
  // Boleto
  dueDate?: string;
  barcodeNumber?: string;
}
