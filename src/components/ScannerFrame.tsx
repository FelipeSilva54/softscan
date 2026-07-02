import React from 'react';
import { Path, Svg } from 'react-native-svg';
import { colors } from '../theme';

interface ScannerFrameProps {
  shape: 'square' | 'rectangle';
}

export const FRAME_RADIUS = 28;
const STROKE_WIDTH = 2;
const DASH_ARRAY = '28 20';

export function getFrameSize(shape: ScannerFrameProps['shape']) {
  return shape === 'square' ? { width: 260, height: 260 } : { width: 300, height: 170 };
}

export function ScannerFrame({ shape }: ScannerFrameProps) {
  const { width, height } = getFrameSize(shape);
  const r = FRAME_RADIUS;
  const inset = STROKE_WIDTH / 2;
  const w = width - STROKE_WIDTH;
  const h = height - STROKE_WIDTH;
  const x0 = inset;
  const y0 = inset;
  const x1 = inset + w;
  const y1 = inset + h;

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
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Path d={corners} stroke={colors.white} strokeWidth={STROKE_WIDTH} fill="none" />
      <Path
        d={edges}
        stroke={colors.white}
        strokeWidth={STROKE_WIDTH}
        strokeDasharray={DASH_ARRAY}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
