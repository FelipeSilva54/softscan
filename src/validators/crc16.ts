// CRC16-CCITT-FALSE (poly 0x1021, init 0xFFFF, sem reflexão, XOR final 0x0000).
// Usado no campo 63 do payload EMVCo/BR Code do PIX.

export function calculateCRC16(payload: string): string {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;

    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// O payload do PIX termina em "6304XXXX", onde XXXX é o próprio CRC.
// O CRC é calculado sobre tudo, inclusive o "6304", exceto os 4 chars finais.
export function validateCRC16(fullPayload: string): boolean {
  if (fullPayload.length < 4) return false;

  const providedCRC = fullPayload.slice(-4).toUpperCase();
  const dataToVerify = fullPayload.slice(0, -4);
  const calculatedCRC = calculateCRC16(dataToVerify);

  return providedCRC === calculatedCRC;
}
