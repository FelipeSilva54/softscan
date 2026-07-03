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

interface CardButtonHorizontalProps {
  label: string;
  icon: IconName;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CardButtonHorizontal({ label, icon, onPress, style }: CardButtonHorizontalProps) {
  return (
    <View style={[styles.shadowWrapper, style]} collapsable={false}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    width: '100%',
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    ...shadow.card,
  },
  wrapper: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  label: {
    ...textStyles.label,
    color: colors.secondary,
  },
});
