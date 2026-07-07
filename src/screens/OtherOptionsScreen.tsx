import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Platform, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardButtonHorizontal } from '../components/CardButtonHorizontal';
import { Header } from '../components/Header';
import { SaveResultSheet } from '../components/SaveResultSheet';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getUserName, setUserName } from '../storage/userStorage';
import { colors, spacing, textStyles } from '../theme';

export function OtherOptionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [userName, setUserNameState] = useState<string | null>(null);
  const [isNameSheetVisible, setNameSheetVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getUserName().then(setUserNameState);
    }, [])
  );

  async function handleSaveName(newName: string) {
    await setUserName(newName);
    setUserNameState(newName);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Nome atualizado', ToastAndroid.SHORT);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header onBackPress={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Outras opções</Text>
        <CardButtonHorizontal
          label="Histórico"
          icon="history"
          onPress={() => navigation.navigate('History')}
        />
        <CardButtonHorizontal
          style={styles.editName}
          label="Editar nome"
          icon="edit"
          onPress={() => setNameSheetVisible(true)}
        />
        <View style={styles.group}>
          <Text style={styles.groupLabel}>Sobre o app</Text>
          <CardButtonHorizontal
            label="Compartilhe com um amigo"
            icon="share"
            onPress={() => {}}
          />
          <CardButtonHorizontal
            label="Apoie o SoftScan"
            icon="heart"
            onPress={() => navigation.navigate('Donate')}
          />
          <CardButtonHorizontal
            label="Avalie o aplicativo"
            icon="hand-stars"
            onPress={() => {}}
          />
        </View>
      </View>
      <SaveResultSheet
        visible={isNameSheetVisible}
        onClose={() => setNameSheetVisible(false)}
        onSave={handleSaveName}
        initialName={userName ?? ''}
        placeholder="Ex: Lucas"
        title="Editar nome"
        buttonLabel="Salvar"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 28,
  },
  title: {
    ...textStyles.heading,
    color: colors.secondary,
    marginBottom: 40,
  },
  editName: {
    marginTop: spacing.md,
  },
  group: {
    marginTop: spacing.xxxl,
    gap: spacing.lg,
  },
  groupLabel: {
    ...textStyles.body,
    color: colors.gray,
  },
});
