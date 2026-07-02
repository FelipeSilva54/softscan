import { validateCRC16 } from '../validators/crc16';
import { PixData, PixKeyType } from '../types/pix.types';

interface TLVField {
  id: string;
  length: number;
  value: string;
}

function parseTLV(payload: string): TLVField[] {
  const fields: TLVField[] = [];
  let i = 0;

  while (i < payload.length) {
    const id = payload.substr(i, 2);
    const length = parseInt(payload.substr(i + 2, 2), 10);

    if (id.length < 2 || Number.isNaN(length)) break;

    const value = payload.substr(i + 4, length);
    fields.push({ id, length, value });
    i += 4 + length;
  }

  return fields;
}

function inferPixKeyType(key: string): PixKeyType {
  if (key.includes('@')) return 'email';
  if (/^\d{11}$/.test(key)) return 'cpf';
  if (/^\d{14}$/.test(key)) return 'cnpj';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) return 'aleatoria';
  if (/^\+?\d{10,13}$/.test(key.replace(/[^\d+]/g, ''))) return 'telefone';
  return 'desconhecida';
}

const CURRENCY_CODES: Record<string, string> = {
  '986': 'BRL',
};

export function parsePixPayload(rawPayload: string): PixData {
  const fields = parseTLV(rawPayload);

  // Campo 00 (Payload Format Indicator) = "01" é obrigatório e fixo em
  // qualquer QR EMVCo — é o que diferencia "isso é um Pix com problema" de
  // "isso não é um Pix, é outro QR qualquer".
  const isRecognized = fields.some((field) => field.id === '00' && field.value === '01');
  const isValid = isRecognized && validateCRC16(rawPayload);

  const data: PixData = {
    isValid,
    isRecognized,
    rawPayload,
  };

  for (const field of fields) {
    switch (field.id) {
      case '52':
        data.merchantCategoryCode = field.value;
        break;
      case '53':
        data.currency = CURRENCY_CODES[field.value] ?? field.value;
        break;
      case '54': {
        const amount = parseFloat(field.value);
        if (!Number.isNaN(amount)) data.amount = amount;
        break;
      }
      case '58':
        data.countryCode = field.value;
        break;
      case '59':
        data.merchantName = field.value;
        break;
      case '60':
        data.merchantCity = field.value;
        break;
      case '62': {
        const additionalFields = parseTLV(field.value);
        const txid = additionalFields.find((sub) => sub.id === '05');
        if (txid) data.txid = txid.value;
        break;
      }
      default:
        // Merchant Account Information (Pix) fica em algum ID entre 26 e 51,
        // dependendo do PSP — não é fixo em "26".
        if (field.id >= '26' && field.id <= '51') {
          const subFields = parseTLV(field.value);
          const gui = subFields.find((sub) => sub.id === '00');

          if (gui?.value === 'br.gov.bcb.pix') {
            const key = subFields.find((sub) => sub.id === '01');
            const url = subFields.find((sub) => sub.id === '25');

            if (key) {
              data.pixKey = key.value;
              data.pixKeyType = inferPixKeyType(key.value);
            } else if (url) {
              // PIX dinâmico: dados completos exigiriam consulta à API do PSP (fora de escopo, sem backend).
              data.isDynamic = true;
            }
          }
        }
        break;
    }
  }

  return data;
}
