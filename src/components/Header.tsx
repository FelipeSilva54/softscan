import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BackIcon } from '../icons/BackIcon';
import { MenuIcon } from '../icons/MenuIcon';
import { SoftscanLogo } from '../icons/SoftscanLogo';
import { spacing } from '../theme';

type HeaderDefault = {
  variant?: 'default';
  showMenu?: boolean;
  onMenuPress?: () => void;
};

type HeaderBack = {
  variant: 'back';
  onBackPress?: () => void;
};

type HeaderProps = HeaderDefault | HeaderBack;

export function Header(props: HeaderProps) {
  if (props.variant === 'back') {
    return (
      <View style={styles.container}>
        <Pressable
          onPress={props.onBackPress}
          style={styles.iconButton}
          hitSlop={8}
        >
          <BackIcon size={22} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SoftscanLogo />
      {props.showMenu && (
        <Pressable
          onPress={props.onMenuPress}
          style={styles.iconButton}
          hitSlop={8}
        >
          <MenuIcon />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
