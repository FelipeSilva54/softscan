import React from 'react';
import { Circle, G, Mask, Svg } from 'react-native-svg';

interface AppLogoProps {
  size?: number;
}

export function AppLogo({ size = 52 }: AppLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <Mask id="mask0_55_282" maskUnits="userSpaceOnUse" x={5} y={5} width={41} height={41}>
        <Circle
          cx={25.8583}
          cy={25.8583}
          r={20}
          transform="rotate(21.0965 25.8583 25.8583)"
          fill="#C4C4C4"
        />
      </Mask>
      <G mask="url(#mask0_55_282)">
        <Circle
          opacity={0.4}
          cx={25.4584}
          cy={0.460328}
          r={16.5932}
          transform="rotate(-0.903464 25.4584 0.460328)"
          fill="#0073C9"
        />
        <Circle
          opacity={0.4}
          cx={26.2596}
          cy={51.2562}
          r={16.5932}
          transform="rotate(-0.903464 26.2596 51.2562)"
          fill="#0073C9"
        />
        <Circle
          cx={0.460809}
          cy={26.2592}
          r={16.5932}
          transform="rotate(-0.903464 0.460809 26.2592)"
          fill="#0073C9"
        />
        <Circle
          cx={51.2382}
          cy={24.2943}
          r={16.5932}
          transform="rotate(-0.903464 51.2382 24.2943)"
          fill="#0073C9"
        />
      </G>
    </Svg>
  );
}
