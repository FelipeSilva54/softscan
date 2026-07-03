import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleProp,
  StyleSheet,
  TouchableNativeFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, textStyles } from '../theme';

interface PillProps {
  label: string;
  active: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Pill({ label, active, onPress, style }: PillProps) {
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: active ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [active, progress]);

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.white, colors.primary],
  });

  const textColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.secondary, colors.white],
  });

  return (
    <View style={[styles.wrapper, style]}>
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple(
          active ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.06)',
          false
        )}
      >
        <Animated.View style={[styles.pill, { backgroundColor }]}>
          <Animated.Text style={[styles.label, { color: textColor }]}>{label}</Animated.Text>
        </Animated.View>
      </TouchableNativeFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 40,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  pill: {
    flex: 1,
    height: 40,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  label: {
    ...textStyles.subtitle,
  },
});
