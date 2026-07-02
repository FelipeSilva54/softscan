import { calculateModulo10 } from '../validators/modulo10';
import { calculateModulo11 } from '../validators/modulo11';
import { BoletoData } from '../types/boleto.types';
import { BANK_NAMES } from './bankCodes';

// Fator de vencimento reiniciou em 1000 a partir de 22/02/2025 (nova regra FEBRABAN).
// Como todo boleto em circulação hoje foi emitido depois disso, assumimos sempre esse ciclo.
const FATOR_BASE = 1000;
const DATA_BASE = Date.UTC(2025, 1, 22);
const DIA_EM_MS = 24 * 60 * 60 * 1000;

function calcularDataVencimento(fator: number): Date | undefined {
  if (fator === 0) return undefined;
  return new Date(DATA_BASE + (fator - FATOR_BASE) * DIA_EM_MS);
}

function parseCobranca(barcode: string): BoletoData {
  const bankCode = barcode.substring(0, 3);
  const currencyCode = barcode.substring(3, 4);
  const digitsWithoutDV = barcode.substring(0, 4) + barcode.substring(5);
  const isValid = calculateModulo11(digitsWithoutDV) === parseInt(barcode[4], 10);

  const fatorVencimento = parseInt(barcode.substring(5, 9), 10);
  const valorCentavos = parseInt(barcode.substring(9, 19), 10);
  const freeField = barcode.substring(19, 44);

  return {
    isValid,
    isRecognized: true,
    rawBarcode: barcode,
    format: 'cobranca',
    bankCode,
    bankName: BANK_NAMES[bankCode],
    currencyCode,
    amount: valorCentavos > 0 ? valorCentavos / 100 : undefined,
    dueDate: calcularDataVencimento(fatorVencimento),
    freeField,
  };
}

function parseConvenio(barcode: string): BoletoData {
  const dvPosition = barcode[2] === '6' || barcode[2] === '8' ? 'modulo10' : 'modulo11';
  const digitsWithoutDV = barcode.substring(0, 3) + barcode.substring(4);
  const dv = parseInt(barcode[3], 10);

  const isValid =
    dvPosition === 'modulo10'
      ? calculateModulo10(digitsWithoutDV) === dv
      : calculateModulo11(digitsWithoutDV) === dv;

  const valorCentavos = parseInt(barcode.substring(4, 15), 10);
  const freeField = barcode.substring(15, 48);

  return {
    isValid,
    isRecognized: true,
    rawBarcode: barcode,
    format: 'convenio',
    amount: valorCentavos > 0 ? valorCentavos / 100 : undefined,
    freeField,
  };
}

export function parseBoletoBarcode(rawBarcode: string): BoletoData {
  const barcode = rawBarcode.replace(/\D/g, '');

  if (barcode.length === 48 && barcode.startsWith('8')) {
    return parseConvenio(barcode);
  }

  if (barcode.length === 44) {
    return parseCobranca(barcode);
  }

  return {
    isValid: false,
    isRecognized: false,
    rawBarcode,
    format: 'cobranca',
  };
}
