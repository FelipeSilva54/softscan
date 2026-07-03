import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { colors, radius, spacing, textStyles } from '../theme';
import { Button } from './Button';
import { Input } from './Input';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const OPEN_DURATION = 280;
const CLOSE_DURATION = 220;
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 1.2;

interface SaveResultSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  placeholder?: string;
}

export function SaveResultSheet({
  visible,
  onClose,
  onSave,
  placeholder = 'Ex: Pix da Sofia',
}: SaveResultSheetProps) {
  const [name, setName] = useState('');
  const [isMounted, setIsMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      translateY.setValue(SCREEN_HEIGHT);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: OPEN_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: OPEN_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  function animateClose(after?: () => void) {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: CLOSE_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: CLOSE_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMounted(false);
      setName('');
      after?.();
    });
  }

  function handleDismiss() {
    animateClose(onClose);
  }

  function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    onSave(trimmedName);
    animateClose(() => {
      onClose();
      if (Platform.OS === 'android') {
        ToastAndroid.show('Resultado salvo no histórico', ToastAndroid.SHORT);
      }
    });
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY) {
          handleDismiss();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  if (!isMounted) return null;

  return (
    <Modal visible transparent statusBarTranslucent animationType="none" onRequestClose={handleDismiss}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]} />
        </Pressable>
        <KeyboardAvoidingView
          style={styles.keyboardWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          pointerEvents="box-none"
        >
          <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
            <View {...panResponder.panHandlers} style={styles.dragArea}>
              <View style={styles.handle} />
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>Digite um nome</Text>
              <Input value={name} onChangeText={setName} placeholder={placeholder} autoCapitalize="sentences" />
              <Button
                label="Salvar resultado"
                onPress={handleSave}
                disabled={!name.trim()}
                style={styles.button}
              />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: colors.overlay,
  },
  keyboardWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxl,
  },
  dragArea: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    ...textStyles.subheading,
    color: colors.secondary,
  },
  button: {
    marginTop: spacing.xs,
  },
});
