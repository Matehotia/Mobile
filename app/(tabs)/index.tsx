<<<<<<< Updated upstream
import { Image, StyleSheet, Platform, Button } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { Redirect } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
=======
import { StyleSheet } from 'react-native';
>>>>>>> Stashed changes
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
  const { logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

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
<<<<<<< Updated upstream
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Button title="Déconnexion" onPress={handleLogout} />
      </ThemedView>
    </ParallaxScrollView>
=======
    </ThemedView>
>>>>>>> Stashed changes
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