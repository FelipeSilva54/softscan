// Resultado de qualquer QR Code ou código de barras lido que não é um Pix
// nem um boleto reconhecido (ex: URL, wi-fi, produto, texto livre).
export interface GenericScanData {
  rawValue: string;
  barcodeType: string;
}
