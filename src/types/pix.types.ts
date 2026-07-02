export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria' | 'desconhecida';

export interface PixData {
  isValid: boolean;
  // Payload EMVCo tem o indicador de formato (campo 00 = "01"). Sem ele o QR
  // nem chega a se propor a ser um Pix — não é "Pix inválido", é outro QR.
  isRecognized: boolean;
  rawPayload: string;
  pixKey?: string;
  pixKeyType?: PixKeyType;
  merchantName?: string;
  merchantCity?: string;
  amount?: number;
  currency?: string;
  countryCode?: string;
  txid?: string;
  merchantCategoryCode?: string;
  // PIX dinâmico: chave real fica atrás de uma URL do PSP, não resolvida localmente (sem backend).
  isDynamic?: boolean;
}
