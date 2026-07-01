import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing, textStyles } from '../theme';

interface ValueProps {
  caption: string;
  value: string;
  style?: StyleProp<ViewStyle>;
}

export function Value({ caption, value, style }: ValueProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.caption}>{caption}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  caption: {
    ...textStyles.caption,
    color: colors.gray,
  },
  value: {
    ...textStyles.title,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
});
