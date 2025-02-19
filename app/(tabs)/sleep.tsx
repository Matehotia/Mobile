import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, TextInput, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { LineChart } from 'react-native-chart-kit';
import { AntDesign } from '@expo/vector-icons';

type SleepRecord = {
  sleep_date: string;
  sleep_start: string;
  sleep_end: string;
  quality: number;
};

export default function SleepScreen() {
  const [sleepData, setSleepData] = useState<SleepRecord[]>([]);
  const [averageQuality, setAverageQuality] = useState(0);
  const [averageDuration, setAverageDuration] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newSleep, setNewSleep] = useState({
    sleep_date: new Date().toISOString().split('T')[0],
    sleep_start: '23:00',
    sleep_end: '07:00',
    quality: 5
  });

  const fetchSleepData = async () => {
    try {
      const response = await fetch('http://172.20.10.2:3000/sleep-records');
      const data = await response.json();
      setSleepData(data);
      calculateStats(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const calculateStats = (data: SleepRecord[]) => {
    if (data.length === 0) return;

    // Calcul de la qualité moyenne
    const avgQuality = data.reduce((sum, record) => sum + record.quality, 0) / data.length;
    setAverageQuality(Number(avgQuality.toFixed(1)));

    // Calcul de la durée moyenne
    const avgDuration = calculateAverageDuration(data);
    setAverageDuration(avgDuration);
  };

  const calculateAverageDuration = (data: SleepRecord[]) => {
    let totalMinutes = 0;
    data.forEach(record => {
      const duration = calculateDuration(record.sleep_start, record.sleep_end);
      totalMinutes += duration;
    });
    const avgMinutes = totalMinutes / data.length;
    const hours = Math.floor(avgMinutes / 60);
    const minutes = Math.round(avgMinutes % 60);
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  const calculateDuration = (start: string, end: string) => {
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    let hours = endHours - startHours;
    let minutes = endMinutes - startMinutes;
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    if (hours < 0) hours += 24;
    return hours * 60 + minutes;
  };

  const handleAddSleep = () => {
    setModalVisible(true);
  };

  const handleSaveSleep = async () => {
    // Vérification de la qualité
    const quality = Number(newSleep.quality);
    if (quality < 1 || quality > 5) {
      Alert.alert('Erreur', 'La qualité doit être entre 1 et 5');
      return;
    }

    try {
      const response = await fetch('http://172.20.10.2:3000/sleep-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newSleep,
          quality: quality  // S'assurer que c'est un nombre
        }),
      });

      if (response.ok) {
        Alert.alert('Succès', 'Sommeil enregistré !');
        setModalVisible(false);
        fetchSleepData();
      } else {
        Alert.alert('Erreur', 'Impossible d\'enregistrer le sommeil');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  useEffect(() => {
    fetchSleepData();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        {/* En-tête avec statistiques */}
        <ThemedView style={styles.header}>
          <ThemedText type="title">Suivi du Sommeil</ThemedText>
        </ThemedView>

        {/* Cartes de statistiques */}
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statCard}>
            <ThemedText style={styles.statLabel}>Durée moyenne</ThemedText>
            <ThemedText style={styles.statValue}>{averageDuration}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statCard}>
            <ThemedText style={styles.statLabel}>Qualité moyenne</ThemedText>
            <ThemedText style={styles.statValue}>{averageQuality}/5</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Graphique */}
        <ThemedView style={styles.graphContainer}>
          <ThemedText style={styles.sectionTitle}>Les 7 derniers jours</ThemedText>
          {sleepData.length > 0 && (
            <LineChart
              data={{
                labels: sleepData.slice(-7).map(record => record.sleep_date.slice(5)),
                datasets: [{
                  data: sleepData.slice(-7).map(record => 
                    calculateDuration(record.sleep_start, record.sleep_end) / 60
                  )
                }]
              }}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 100, 255, ${opacity})`,
                style: {
                  borderRadius: 16
                }
              }}
              style={styles.graph}
            />
          )}
        </ThemedView>

        {/* Historique */}
        <ThemedView style={styles.historyContainer}>
          <ThemedText style={styles.sectionTitle}>Historique</ThemedText>
          {sleepData.map((record, index) => (
            <ThemedView key={index} style={styles.historyItem}>
              <ThemedText style={styles.historyDate}>
                {new Date(record.sleep_date).toLocaleDateString('fr-FR')}
              </ThemedText>
              <ThemedText>
                {record.sleep_start.slice(0, 5)} → {record.sleep_end.slice(0, 5)}
              </ThemedText>
              <ThemedText>Qualité: {record.quality}/5</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </ScrollView>

      {/* Bouton flottant pour ajouter */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddSleep}>
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal pour ajouter un nouveau sommeil */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Nouveau sommeil</ThemedText>
            
            <ThemedView style={styles.inputGroup}>
              <ThemedText>Heure de coucher:</ThemedText>
              <TextInput
                style={styles.input}
                value={newSleep.sleep_start}
                onChangeText={(text) => setNewSleep({...newSleep, sleep_start: text})}
                placeholder="23:00"
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText>Heure de réveil:</ThemedText>
              <TextInput
                style={styles.input}
                value={newSleep.sleep_end}
                onChangeText={(text) => setNewSleep({...newSleep, sleep_end: text})}
                placeholder="07:00"
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText>Qualité:</ThemedText>
              <ThemedView style={styles.qualityContainer}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.qualityButton,
                      newSleep.quality === num && styles.qualityButtonSelected
                    ]}
                    onPress={() => setNewSleep({...newSleep, quality: num})}
                  >
                    <ThemedText style={[
                      styles.qualityButtonText,
                      newSleep.quality === num && styles.qualityButtonTextSelected
                    ]}>
                      {num}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={styles.buttonText}>Annuler</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSaveSleep}
              >
                <ThemedText style={styles.buttonText}>Enregistrer</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  graphContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  graph: {
    marginVertical: 8,
    borderRadius: 16,
  },
  historyContainer: {
    padding: 20,
  },
  historyItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  historyDate: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  qualityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  qualityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  qualityButtonSelected: {
    backgroundColor: '#007AFF',
  },
  qualityButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  qualityButtonTextSelected: {
    color: 'white',
  },
});