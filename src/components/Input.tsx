import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, spacing, textStyles } from '../theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface InputProps extends Pick<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'keyboardType' | 'autoCapitalize' | 'maxLength'> {
  style?: StyleProp<ViewStyle>;
}

export function Input({ value, style, ...rest }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const colorAnim = useRef(new Animated.Value(0)).current;
  const widthAnim = useRef(new Animated.Value(0)).current;

  const isFilled = !isFocused && !!value;

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: isFocused || isFilled ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, isFilled, colorAnim]);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, widthAnim]);

  const borderBottomColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.input, colors.secondary],
  });

  const borderBottomWidth = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  return (
    <AnimatedTextInput
      {...rest}
      value={value}
      style={[styles.input, { borderBottomColor, borderBottomWidth }, style]}
      placeholderTextColor={colors.input}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 62,
    paddingVertical: spacing.md,
    ...textStyles.input,
    color: colors.secondary,
  },
});
