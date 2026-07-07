// Detecta se o conteúdo lido é um link (URL de página web ou deep link de
// app), caso em que a tela de resultado oferece "Abrir link" em vez de
// "Copiar código".
const LINK_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//;

export function isWebLink(value: string): boolean {
  return LINK_PATTERN.test(value.trim());
}
