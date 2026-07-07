import { calculateModulo10 } from '../validators/modulo10';
import { calculateModulo11, calculateModulo11Convenio } from '../validators/modulo11';
import { BoletoData } from '../types/boleto.types';
import { BANK_NAMES } from './bankCodes';

// Segmento de arrecadação, identificado pela 2ª posição do código de barras de
// convênio (a 1ª é sempre '8'). Convênio não tem código de banco — o segmento é
// o que dá contexto de "quem está cobrando". Fonte: Manual FEBRABAN de Arrecadação.
const SEGMENT_NAMES: Record<string, string> = {
  '1': 'Prefeitura',
  '2': 'Saneamento',
  '3': 'Energia elétrica e gás',
  '4': 'Telecomunicações',
  '5': 'Órgão governamental',
  '6': 'Carnês e assemelhados',
  '7': 'Multas de trânsito',
  '9': 'Outros',
};

// Fator de vencimento reiniciou em 1000 a partir de 22/02/2025 (nova regra FEBRABAN).
// Como todo boleto em circulação hoje foi emitido depois disso, assumimos sempre esse ciclo.
const FATOR_BASE = 1000;
const DATA_BASE = Date.UTC(2025, 1, 22);
const DIA_EM_MS = 24 * 60 * 60 * 1000;

function calcularDataVencimento(fator: number): Date | undefined {
  if (fator === 0) return undefined;
  return new Date(DATA_BASE + (fator - FATOR_BASE) * DIA_EM_MS);
}

// "Linha digitável" é o que o banco espera ao COLAR/DIGITAR o boleto pra pagar
// (o código de barras cru de 44 dígitos não é aceito do mesmo jeito). Pra
// cobrança bancária: 47 dígitos em 5 campos, cada um dos 3 primeiros com DV
// módulo 10 próprio. Ver Manual FEBRABAN de Código de Barras.
function gerarLinhaDigitavelCobranca(barcode: string): string {
  const campo1Base = barcode.substring(0, 4) + barcode.substring(19, 24);
  const campo1 = campo1Base + calculateModulo10(campo1Base);

  const campo2Base = barcode.substring(24, 34);
  const campo2 = campo2Base + calculateModulo10(campo2Base);

  const campo3Base = barcode.substring(34, 44);
  const campo3 = campo3Base + calculateModulo10(campo3Base);

  const campo4 = barcode.substring(4, 5);
  const campo5 = barcode.substring(5, 19);

  return (
    `${campo1.slice(0, 5)}.${campo1.slice(5)} ` +
    `${campo2.slice(0, 5)}.${campo2.slice(5)} ` +
    `${campo3.slice(0, 5)}.${campo3.slice(5)} ` +
    `${campo4} ${campo5}`
  );
}

// Pra convênio/arrecadação: 48 dígitos em 4 blocos de 11, cada um com seu
// próprio DV (mesma regra módulo 10/11 do DV geral do código de barras).
function gerarLinhaDigitavelConvenio(barcode: string, useModulo10: boolean): string {
  const blocks = [barcode.substring(0, 11), barcode.substring(11, 22), barcode.substring(22, 33), barcode.substring(33, 44)];

  return blocks
    .map((block) => {
      const dv = useModulo10 ? calculateModulo10(block) : calculateModulo11Convenio(block);
      return `${block}-${dv}`;
    })
    .join(' ');
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
    linhaDigitavel: gerarLinhaDigitavelCobranca(barcode),
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
  // Identificador de valor/moeda (posição 3 do código de barras): 6 ou 7 usam
  // módulo 10; 8 ou 9 usam módulo 11. Confirmado batendo os 4 DVs de bloco +
  // o DV geral de um boleto de convênio real contra as duas fórmulas — os 5
  // batiam com módulo 11 pro identificador '8', nenhum batia com módulo 10.
  const useModulo10 = barcode[2] === '6' || barcode[2] === '7';
  const digitsWithoutDV = barcode.substring(0, 3) + barcode.substring(4);
  const dv = parseInt(barcode[3], 10);

  const isValid = useModulo10
    ? calculateModulo10(digitsWithoutDV) === dv
    : calculateModulo11Convenio(digitsWithoutDV) === dv;

  const valorCentavos = parseInt(barcode.substring(4, 15), 10);
  const freeField = barcode.substring(15);

  return {
    isValid,
    isRecognized: true,
    rawBarcode: barcode,
    linhaDigitavel: gerarLinhaDigitavelConvenio(barcode, useModulo10),
    format: 'convenio',
    segment: SEGMENT_NAMES[barcode[1]] ?? 'Arrecadação',
    amount: valorCentavos > 0 ? valorCentavos / 100 : undefined,
    freeField,
  };
}

export function parseBoletoBarcode(rawBarcode: string): BoletoData {
  const barcode = rawBarcode.replace(/\D/g, '');

  // O código de barras (lido pela câmera) tem sempre 44 dígitos tanto pra
  // cobrança bancária quanto pra convênio/arrecadação (água, luz, telefone
  // etc) — só a "linha digitável" digitada manualmente (47/48 dígitos, com
  // DVs extras por bloco) é diferente. O dígito inicial '8' é reservado pela
  // FEBRABAN exclusivamente pra identificar convênio.
  if (barcode.length !== 44) {
    return {
      isValid: false,
      isRecognized: false,
      rawBarcode,
      format: 'cobranca',
    };
  }

  if (barcode.startsWith('8')) {
    return parseConvenio(barcode);
  }

  return parseCobranca(barcode);
}
