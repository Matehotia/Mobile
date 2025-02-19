import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      {/* Section Rappel du Jour */}
      <ThemedView style={styles.section}>
        <ThemedText type="title">Révisions du Jour</ThemedText>
        <ThemedView style={styles.reminderCard}>
          <ThemedText type="subtitle">Prochaine révision</ThemedText>
          <ThemedText>Mathématiques - 14h30</ThemedText>
          <ThemedText>Chapitre 3: Algèbre linéaire</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Section Statistiques */}
      <ThemedView style={styles.section}>
        <ThemedText type="title">Aperçu</ThemedText>
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statCard}>
            <ThemedText>Temps de sommeil</ThemedText>
            <ThemedText type="subtitle">7h30</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statCard}>
            <ThemedText>Révisions prévues</ThemedText>
            <ThemedText type="subtitle">3</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  reminderCard: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statCard: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
  },
});