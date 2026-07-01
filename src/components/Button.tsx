import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, textStyles } from '../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, disabled = false, loading = false, style }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <View style={[styles.wrapper, isDisabled && styles.wrapperDisabled, style]}>
      <TouchableNativeFeedback
        onPress={onPress}
        disabled={isDisabled}
        background={TouchableNativeFeedback.Ripple('rgba(255,255,255,0.2)', false)}
      >
        <View style={styles.button}>
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.label}>{label}</Text>
          )}
        </View>
      </TouchableNativeFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 56,
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: colors.primary,
  },
  wrapperDisabled: {
    opacity: 0.5,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...textStyles.subtitle,
    color: colors.white,
  },
});
