import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, textStyles } from '../theme';
import { Icon } from './Icon';

const AnimatedView = Animated.createAnimatedComponent(View);

interface SearchBarProps extends Pick<TextInputProps, 'value' | 'onChangeText' | 'placeholder'> {
  style?: StyleProp<ViewStyle>;
}

export function SearchBar({ value, onChangeText, placeholder = 'Pesquisar item...', style }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, colorAnim]);

  const borderColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const isFilled = !!value;

  return (
    <AnimatedView style={[styles.wrapper, { borderColor }, style]}>
      <Icon name="search" size={24} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray}
        style={styles.input}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {isFilled && (
        <Pressable onPress={() => onChangeText?.('')} hitSlop={spacing.xs}>
          <Icon name="close" size={24} color={colors.gray} />
        </Pressable>
      )}
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    padding: 0,
    ...textStyles.label,
    color: colors.secondary,
    textAlignVertical: 'center',
  },
});
