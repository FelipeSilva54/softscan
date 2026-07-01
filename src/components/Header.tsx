import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BackIcon } from '../icons/BackIcon';
import { spacing } from '../theme';

interface HeaderProps {
  onBackPress?: () => void;
}

export function Header({ onBackPress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onBackPress}
        style={styles.iconButton}
        hitSlop={8}
      >
        <BackIcon size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
