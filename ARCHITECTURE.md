# ARCHITECTURE.md

## Visão geral do fluxo

```
Home (2 cards)
  ├─ Card "Escanear Boleto" → Scanner (modo barcode) → Resultado Boleto
  └─ Card "Escanear PIX"    → Scanner (modo QR)       → Resultado PIX

Menu (acessível via Home)
  ├─ Histórico (lista de leituras passadas, local)
  ├─ Avaliar app (deep link pra Play Store)
  └─ Compartilhar app
```

## Stack técnica e justificativa

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | Expo (managed workflow) | Build simplificado, OTA updates, suficiente pro escopo (sem necessidade de código nativo customizado) |
| Linguagem | TypeScript | Segurança de tipos nos parsers/validadores financeiros — risco alto de bug silencioso em JS puro |
| Navegação | React Navigation (Native Stack) | Padrão de mercado, performance nativa na transição de telas |
| Câmera/Scan | expo-camera (CameraView com barcodeScannerSettings) | Suporta QR Code e formatos de barcode (Code 128, usado em boletos) numa única API |
| Armazenamento local | expo-sqlite (recomendado) ou AsyncStorage | SQLite se o histórico crescer e precisar de busca/filtro/ordenação; AsyncStorage se for lista simples sem necessidade de query complexa. Decisão: começar com AsyncStorage no MVP, migrar para SQLite se histórico ficar complexo (ex: filtros por tipo/data) |
| Ícones | SVGs customizados via react-native-svg | Sem dependência de pacote de ícones pronto, conforme definido pelo produto |
| Design Tokens | Arquivos próprios em /src/theme | Sem lib externa de design system — tokens simples o suficiente para gerenciar manualmente |

## Estrutura de pastas

```
/src
  /screens
    HomeScreen.tsx
    ScannerScreen.tsx
    ResultScreen.tsx
    MenuScreen.tsx
    HistoryScreen.tsx
  /components
    ScanCard.tsx
    ResultCard.tsx
    HistoryItem.tsx
    Icon.tsx              # wrapper pros SVGs customizados
  /parsers
    pixParser.ts           # decodifica payload EMVCo/BR Code
    boletoParser.ts        # decodifica código de barras (44 dígitos): cobrança ou convênio
  /validators
    crc16.ts                # checksum do PIX
    modulo10.ts              # checksum de blocos do boleto
    modulo11.ts              # checksum do campo livre/DV geral do boleto
  /storage
    historyStorage.ts        # CRUD do histórico local (AsyncStorage)
  /navigation
    AppNavigator.tsx
  /types
    pix.types.ts
    boleto.types.ts
    history.types.ts
  /theme
    colors.ts                # paleta de cores (definir depois)
    typography.ts            # fontFamily, tamanhos, pesos
    spacing.ts                # escala de espaçamento (padding, margin, gap)
    radius.ts                  # border-radius
    index.ts                    # exporta tudo centralizado
  /icons                     # SVGs fornecidos pelo usuário, como componentes .tsx
/assets
```

## Design Tokens (Theme)

Todo valor visual (cor, espaçamento, tipografia, radius) DEVE vir de
/src/theme. Proibido usar valores soltos ("magic numbers/colors") direto
nos componentes — isso garante consistência visual e facilita mudanças
futuras (ex: trocar cor primária do app inteiro em um lugar só).

Regra para qualquer código gerado (humano ou IA):
- Errado: padding: 16 / color: '#FF5500' direto no componente
- Certo: padding: spacing.md / color: colors.primary

Cores ainda não definidas (placeholder até decisão visual). Demais tokens
(spacing, radius, typography) podem ser estruturados desde já com valores
provisórios.

## Modelo de dados (histórico local)

```typescript
type ScanType = 'pix' | 'boleto';

interface ScanRecord {
  id: string;              // uuid local
  type: ScanType;
  rawCode: string;          // código original escaneado
  scannedAt: string;        // ISO date
  isValid: boolean;         // resultado da validação de checksum
  // PIX
  pixKey?: string;
  merchantName?: string;
  amount?: number;
  // Boleto
  dueDate?: string;
  barcodeNumber?: string;
}
```

## Decisões técnicas em aberto (revisar conforme o projeto avança)

- [ ] AsyncStorage vs SQLite — decidir após validar volume real de uso
- [ ] Limite de itens no histórico (ex: 100 últimas leituras, com purge automático)
- [ ] Permissão de câmera: tratamento de "negado" (tela de fallback explicando como habilitar nas configs do celular)
- [ ] Deep link de "avaliar app" (precisa do link real da Play Store assim que o app for publicado)
- [ ] Paleta de cores e definição visual final (tema claro/escuro?)

## Build e deploy

- Build via EAS Build (Expo Application Services), gerando .aab para upload na Play Store
- Sem necessidade de configuração para iOS neste momento