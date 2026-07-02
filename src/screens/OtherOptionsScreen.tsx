import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardButtonHorizontal } from '../components/CardButtonHorizontal';
import { Header } from '../components/Header';
import { colors, spacing, textStyles } from '../theme';

export function OtherOptionsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <Header onBackPress={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Outras opções</Text>
        <CardButtonHorizontal
          label="Histórico"
          icon="history"
          onPress={() => {}}
        />
        <View style={styles.group}>
          <Text style={styles.groupLabel}>Sobre o app</Text>
          <CardButtonHorizontal
            label="Compartilhe com um amigo"
            icon="share"
            onPress={() => {}}
          />
          <CardButtonHorizontal
            label="Apoie o Scanow"
            icon="heart"
            onPress={() => {}}
          />
          <CardButtonHorizontal
            label="Avalie o aplicativo"
            icon="hand-stars"
            onPress={() => {}}
          />
        </View>
      </View>
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
  group: {
    marginTop: spacing.xxxl,
    gap: spacing.lg,
  },
  groupLabel: {
    ...textStyles.body,
    color: colors.gray,
  },
});
