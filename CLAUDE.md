# CLAUDE.md

Este arquivo orienta IAs (Claude Code, Claude.ai) trabalhando neste projeto.

## O que é o projeto

App mobile (React Native + Expo) para escanear QR Code PIX e código de barras
de boleto bancário. Extrai e exibe os dados (valor, vencimento, beneficiário,
etc), permite copiar o código e compartilhar. Mantém histórico local das
leituras. Sem login, sem backend, tudo local no dispositivo.

## Stack

- **Framework**: Expo (React Native), SDK 57
- **Linguagem**: TypeScript
- **Navegação**: React Navigation (a definir: Stack ou Bottom Tabs)
- **Armazenamento local**: AsyncStorage ou expo-sqlite (ver ARCHITECTURE.md)
- **Câmera/Scanner**: expo-camera (BarcodeScanner)
- **Ícones**: SVGs customizados — NÃO usar libs de ícones (react-native-vector-icons, lucide, etc)
- **Deploy**: Google Play Store apenas (sem App Store / iOS por enquanto)

## Regras importantes para a IA

1. **Nunca instalar lib de ícones.** Ícones são SVGs fornecidos pelo usuário,
   importados como componentes.
2. **Sem autenticação/login.** Não sugerir, não implementar. Tudo é local.
3. **Sem backend próprio.** Não criar API, não sugerir Firebase/Supabase para
   dados do usuário, a menos que explicitamente pedido.
4. **Validação de dados financeiros é crítica.** Boleto e PIX têm checksum
   (módulo 10/11 e CRC16 respectivamente). NUNCA exibir/permitir copiar um
   código sem validar o checksum primeiro. Se inválido, mostrar erro claro,
   não deixar o usuário seguir sem aviso.
5. **Performance importa.** É um app utilitário — usuário abre, escaneia,
   copia, fecha. Otimizar tempo de abertura da câmera e velocidade de
   detecção do código. Evitar libs pesadas desnecessárias.
6. **TypeScript estrito.** Tipar parsers e validadores explicitamente —
   é a parte mais sensível do app.

## Comandos úteis

```bash
npx expo start          # rodar em dev
npx expo start --clear  # rodar limpando cache (usar se algo parecer "preso")
```

## Estrutura de pastas (ver ARCHITECTURE.md para detalhes)

/src
/screens
/components
/parsers
/validators
/storage
/navigation
/types

## Documentos relacionados

- `ARCHITECTURE.md` — decisões técnicas e estrutura
- `DESIGN.md` — fluxo de telas e regras de produto