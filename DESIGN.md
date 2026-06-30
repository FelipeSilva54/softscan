# DESIGN.md

## Escopo do MVP

App utilitário de scan e validação. Não é um gerenciador de pagamentos,
não envia nem processa pagamento nenhum — só lê, valida, exibe, copia e
compartilha.

### Dentro do escopo (v1)
- Scan de QR Code PIX (estático e dinâmico)
- Scan de código de barras de boleto (linha digitável)
- Parse + validação de checksum de ambos
- Tela de resultado com dados estruturados
- Copiar código (Pix Copia e Cola / linha digitável)
- Compartilhar (share nativo do sistema)
- Histórico local das leituras (sem sync, sem nuvem)
- Avaliar app / Compartilhar app (menu)

### Fora do escopo (v1)
- Login / conta de usuário
- Pagamento dentro do app
- Sync entre dispositivos
- OCR de boleto físico sem código de barra
- iOS / App Store

## Fluxo de telas

```
Home
  - 2 cards grandes, lado a lado ou empilhados:
    [ Escanear Boleto ]  [ Escanear PIX ]
  - Ícone de menu no canto (acessa Menu)
      |
      | clica em um card
      v
Scanner
  - Câmera ativa, overlay de mira
  - Detecta automaticamente ao posicionar o código
      |
      | código detectado
      v
Resultado
  SE válido:
    - Dados estruturados (valor, vencimento, beneficiário, etc)
    - Botão "Copiar código"
    - Botão "Compartilhar"
  SE inválido:
    - Aviso claro de erro, sem permitir copiar

Menu
  - Histórico
  - Avaliar app
  - Compartilhar app
      |
      | clica em Histórico
      v
Histórico
  - Lista de leituras passadas (tipo, data, valor)
  - Clica num item -> reabre tela de Resultado com os dados salvos
```

## Regras de produto

1. Validação é inegociável. Se o checksum do PIX ou boleto não bater,
   o app NUNCA permite copiar ou compartilhar sem aviso explícito de que
   o código pode estar corrompido/inválido. Prioridade: proteger o usuário
   de um pagamento errado, acima de qualquer fricção que isso gere.

2. Detecção automática. O scanner detecta sozinho ao posicionar o
   código no quadro — sem precisar de botão "capturar". Reduz fricção.

3. Histórico é só leitura/consulta. Não precisa de edição manual,
   só visualizar leituras passadas e reabrir o resultado.

4. Tudo local. Nenhum dado sai do dispositivo. Isso deve ficar claro
   pro usuário (ex: numa breve nota na tela de Menu ou Sobre).

## Princípios de UX para este app

- Velocidade acima de tudo. O usuário abre o app pra resolver algo
  rápido (pagar um boleto, mandar um PIX). Cada tela a mais é fricção.
- Estados de erro claros, não técnicos. Nunca mostrar erro tipo
  "CRC mismatch" pro usuário — traduzir pra algo como "Não conseguimos
  confirmar que este código é válido. Tente escanear novamente."
- Sem decoração desnecessária. Foco em clareza dos dados (valor,
  vencimento, nome) — esses são os 3 dados que o usuário mais precisa
  ver rápido, então devem ter destaque visual maior que o resto.

## Sistema de Design (Tokens)

Toda decisão visual do app é guiada por tokens centralizados em
/src/theme, não por valores definidos ad-hoc em cada tela. Isso vale para:

- Cores — paleta única (primária, secundária, texto, fundo, sucesso,
  erro, bordas). A definir.
- Tipografia — escala de tamanhos e pesos consistente, sem fontes ou
  tamanhos "soltos" por tela.
- Spacing — escala fixa de espaçamento (ex: 4 / 8 / 16 / 24 / 32),
  nunca valores arbitrários como padding: 13.
- Radius — cantos arredondados seguindo escala fixa, não variando
  por componente.

Por quê isso importa para um app utilitário: consistência visual reduz
carga cognitiva — o usuário reconhece padrões (mesmo radius de botão,
mesmo espaçamento entre cards) e o app "parece" mais rápido e confiável
mesmo sem mudar a velocidade real.

Qualquer tela ou componente novo deve consumir os tokens de /src/theme,
nunca declarar cor, espaçamento, fonte ou radius diretamente.

## Métricas relevantes (para acompanhar pós-lançamento)

- Taxa de scan bem-sucedido (1ª tentativa) vs precisa repetir
- Tempo médio entre abrir o app e completar uma ação (copiar/compartilhar)
- Taxa de códigos inválidos detectados (sinaliza qualidade da validação
  e também pode indicar fraude sendo barrada)
- Retenção (usuário volta a usar o app em próximos boletos/PIX)