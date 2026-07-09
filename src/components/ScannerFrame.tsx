import React from 'react';
import { G, Path } from 'react-native-svg';
import { colors } from '../theme';

interface ScannerFrameProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const FRAME_RADIUS = 28;
const STROKE_WIDTH = 2;
const DASH_ARRAY = '28 20';

export function getFrameSize(shape: 'square' | 'rectangle', screenWidth?: number) {
  if (shape === 'square') return { width: 260, height: 260 };

  // Código de barras de boleto pode ser bem longo; usa quase toda a
  // largura da tela (com uma margem mínima) em vez de um valor fixo.
  const width = screenWidth ? Math.max(300, Math.min(screenWidth - 32, 340)) : 300;
  return { width, height: 170 };
}

// Desenha só a borda (sem <Svg> próprio) para ser embutida na MESMA árvore
// SVG que recorta o overlay — x/y/width/height são exatamente o retângulo do
// buraco da máscara (já arredondado pelo chamador), então os dois nunca podem
// divergir por fonte de medida (SVG vs layout) ou por arredondamento distinto.
export function ScannerFrame({ x, y, width, height }: ScannerFrameProps) {
  const inset = STROKE_WIDTH / 2;
  const x0 = x + inset;
  const y0 = y + inset;
  const x1 = x + width - inset;
  const y1 = y + height - inset;

  // Deslocar um retângulo arredondado de raio R "pra dentro" por `inset`
  // mantém o CENTRO do arco de cada canto fixo e reduz o raio em `inset`
  // (rr = R - inset). Reusar o raio cheio aqui faria o centro do arco andar
  // (+inset,+inset) em relação ao canto real do buraco da máscara — os dois
  // arcos deixam de ser concêntricos e sobra uma fresta bem no canto.
  const r = FRAME_RADIUS - inset;

  // Cantos e bordas são traçados como sub-paths separados: os cantos ficam
  // sólidos e as bordas retas recebem o tracejado, evitando que o dash
  // "engula" a curva do canto e pareça um círculo sólido.
  const corners =
    `M${x0},${y0 + r} A${r},${r} 0 0 1 ${x0 + r},${y0}` +
    `M${x1 - r},${y0} A${r},${r} 0 0 1 ${x1},${y0 + r}` +
    `M${x1},${y1 - r} A${r},${r} 0 0 1 ${x1 - r},${y1}` +
    `M${x0 + r},${y1} A${r},${r} 0 0 1 ${x0},${y1 - r}`;

  const edges =
    `M${x0 + r},${y0} L${x1 - r},${y0}` +
    `M${x1},${y0 + r} L${x1},${y1 - r}` +
    `M${x1 - r},${y1} L${x0 + r},${y1}` +
    `M${x0},${y1 - r} L${x0},${y0 + r}`;

  return (
    <G>
      <Path d={corners} stroke={colors.white} strokeWidth={STROKE_WIDTH} fill="none" />
      <Path
        d={edges}
        stroke={colors.white}
        strokeWidth={STROKE_WIDTH}
        strokeDasharray={DASH_ARRAY}
        strokeLinecap="round"
        fill="none"
      />
    </G>
  );
}
