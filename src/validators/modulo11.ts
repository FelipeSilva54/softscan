// Módulo 11, usado no DV geral (posição 5) do código de barras de boleto bancário.

function sumWeighted(digits: string): number {
  let sum = 0;
  let weight = 2;

  for (let i = digits.length - 1; i >= 0; i--) {
    sum += parseInt(digits[i], 10) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }

  return sum;
}

export function calculateModulo11(digits: string): number {
  const remainder = sumWeighted(digits) % 11;
  let dv = 11 - remainder;

  // Regra específica do código de barras de boleto de cobrança bancária.
  if (dv === 0 || dv === 10 || dv === 11) {
    dv = 1;
  }

  return dv;
}

// Módulo 11 de convênio/arrecadação (DV geral quando o identificador de valor é
// 7 ou 9, e DV de cada bloco da linha digitável). Mesma soma ponderada do
// módulo 11 de cobrança, mas o tratamento do resto "quebrado" é diferente:
// pelo Manual FEBRABAN de arrecadação, resto 0 ou 1 (dv resultante 11 ou 10)
// vira DV 0 — não 1 como na cobrança bancária. Usar a regra errada aqui
// invalidaria (ou validaria incorretamente) contas de convênio nesses casos.
export function calculateModulo11Convenio(digits: string): number {
  const remainder = sumWeighted(digits) % 11;
  const dv = 11 - remainder;

  return dv === 10 || dv === 11 ? 0 : dv;
}

// barcode44 = código de barras completo (44 dígitos), com o DV na posição 5 (índice 4).
export function validateModulo11(barcode44: string): boolean {
  if (barcode44.length !== 44) return false;

  const dv = parseInt(barcode44[4], 10);
  const digitsWithoutDV = barcode44.slice(0, 4) + barcode44.slice(5);

  return calculateModulo11(digitsWithoutDV) === dv;
}
