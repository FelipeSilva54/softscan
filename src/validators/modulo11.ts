// Módulo 11, usado no DV geral (posição 5) do código de barras de boleto bancário.

export function calculateModulo11(digits: string): number {
  let sum = 0;
  let weight = 2;

  for (let i = digits.length - 1; i >= 0; i--) {
    sum += parseInt(digits[i], 10) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }

  const remainder = sum % 11;
  let dv = 11 - remainder;

  // Regra específica do código de barras de boleto de cobrança bancária.
  if (dv === 0 || dv === 10 || dv === 11) {
    dv = 1;
  }

  return dv;
}

// barcode44 = código de barras completo (44 dígitos), com o DV na posição 5 (índice 4).
export function validateModulo11(barcode44: string): boolean {
  if (barcode44.length !== 44) return false;

  const dv = parseInt(barcode44[4], 10);
  const digitsWithoutDV = barcode44.slice(0, 4) + barcode44.slice(5);

  return calculateModulo11(digitsWithoutDV) === dv;
}
