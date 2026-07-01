// Módulo 10, usado bloco a bloco na linha digitável e no código de barras do boleto.

export function calculateModulo10(digits: string): number {
  let sum = 0;
  let weight = 2;

  for (let i = digits.length - 1; i >= 0; i--) {
    let product = parseInt(digits[i], 10) * weight;

    if (product >= 10) {
      product = Math.floor(product / 10) + (product % 10);
    }

    sum += product;
    weight = weight === 2 ? 1 : 2;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

export function validateModulo10(digitsWithDV: string): boolean {
  if (digitsWithDV.length < 2) return false;

  const dv = parseInt(digitsWithDV.slice(-1), 10);
  const digits = digitsWithDV.slice(0, -1);

  return calculateModulo10(digits) === dv;
}
