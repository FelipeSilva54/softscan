import React, { useEffect, useRef, useState } from 'react';
import { BottomSheet, BottomSheetHandle } from './BottomSheet';
import { Button } from './Button';
import { Input } from './Input';

interface SaveResultSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
  placeholder?: string;
  title?: string;
  buttonLabel?: string;
}

export function SaveResultSheet({
  visible,
  onClose,
  onSave,
  initialName = '',
  placeholder = 'Ex: Pix da Sofia',
  title = 'Digite um nome',
  buttonLabel = 'Salvar resultado',
}: SaveResultSheetProps) {
  const [name, setName] = useState(initialName);
  const sheetRef = useRef<BottomSheetHandle>(null);

  useEffect(() => {
    if (visible) {
      setName(initialName);
    }
  }, [visible, initialName]);

  function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    onSave(trimmedName);
    sheetRef.current?.dismiss();
  }

  return (
    <BottomSheet ref={sheetRef} visible={visible} onClose={onClose} title={title}>
      <Input value={name} onChangeText={setName} placeholder={placeholder} autoCapitalize="sentences" />
      <Button label={buttonLabel} onPress={handleSave} disabled={!name.trim()} />
    </BottomSheet>
  );
}
