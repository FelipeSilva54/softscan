import React, { useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, textStyles } from '../theme';
import { BottomSheet, BottomSheetHandle } from './BottomSheet';
import { Button } from './Button';

interface InvalidCodeSheetProps {
  visible: boolean;
  onClose: () => void;
  onRescan: () => void;
}

export function InvalidCodeSheet({ visible, onClose, onRescan }: InvalidCodeSheetProps) {
  const sheetRef = useRef<BottomSheetHandle>(null);

  function handleRescan() {
    onRescan();
    sheetRef.current?.dismiss();
  }

  return (
    <BottomSheet ref={sheetRef} visible={visible} onClose={onClose} title="Ops! Código inválido">
      <Text style={styles.body}>
        Não foi possível confirmar a validade deste código. Tente escanear novamente.
      </Text>
      <Button label="Escanear novamente" onPress={handleRescan} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    ...textStyles.body,
    color: colors.gray,
  },
});
