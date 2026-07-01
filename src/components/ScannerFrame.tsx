import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { colors, radius } from '../theme';

interface ScannerFrameProps {
  shape: 'square' | 'rectangle';
}

const CORNER_LENGTH = 32;
const STROKE_WIDTH = 4;

export function getFrameSize(shape: ScannerFrameProps['shape']) {
  return shape === 'square' ? { width: 260, height: 260 } : { width: 300, height: 170 };
}

export function ScannerFrame({ shape }: ScannerFrameProps) {
  const { width, height } = getFrameSize(shape);
  const r = radius.lg;
  const c = CORNER_LENGTH;

  return (
    <View style={[styles.wrapper, { width, height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* canto superior esquerdo */}
        <Path
          d={`M${c},${r} A${r},${r} 0 0 1 ${r},${r} L${r},${c}`}
          stroke={colors.white}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
        />
        {/* canto superior direito */}
        <Path
          d={`M${width - c},${r} A${r},${r} 0 0 1 ${width - r},${r} L${width - r},${c}`}
          stroke={colors.white}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
        />
        {/* canto inferior esquerdo */}
        <Path
          d={`M${r},${height - c} L${r},${height - r} A${r},${r} 0 0 0 ${c},${height - r}`}
          stroke={colors.white}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
        />
        {/* canto inferior direito */}
        <Path
          d={`M${width - r},${height - c} L${width - r},${height - r} A${r},${r} 0 0 1 ${width - c},${height - r}`}
          stroke={colors.white}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
