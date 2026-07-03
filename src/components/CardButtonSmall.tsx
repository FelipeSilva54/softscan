import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, shadow, spacing, textStyles } from '../theme';
import { Icon, IconName } from './Icon';

interface CardButtonSmallProps {
  label: string;
  icon: IconName;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CardButtonSmall({ label, icon, onPress, style }: CardButtonSmallProps) {
  return (
    <View style={[styles.shadowWrapper, style]}>
      <View style={styles.wrapper}>
        <TouchableNativeFeedback
          onPress={onPress}
          background={TouchableNativeFeedback.Ripple('rgba(0,0,0,0.06)', false)}
        >
          <View style={styles.card}>
            <Icon name={icon} size={40} />
            <Text style={styles.label}>{label}</Text>
          </View>
        </TouchableNativeFeedback>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    width: 137,
    height: 123,
    borderRadius: radius.md,
    ...shadow.card,
  },
  wrapper: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  label: {
    ...textStyles.caption,
    color: colors.secondary,
  },
});
