import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import { colors, radius, shadow, spacing, textStyles } from '../theme';
import { Icon, IconName } from './Icon';

interface CardButtonProps {
  label: string;
  icon: IconName;
  onPress: () => void;
}

export function CardButton({ label, icon, onPress }: CardButtonProps) {
  return (
    <View style={styles.wrapper}>
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple('rgba(0,0,0,0.06)', false)}
      >
        <View style={styles.card}>
          <Icon name={icon} size={32} />
          <Text style={styles.label}>{label}</Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 168,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    height: 168,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'flex-start',
    gap: 72,
  },
  label: {
    ...textStyles.label,
    color: colors.secondary,
    textAlign: 'left',
  },
});
