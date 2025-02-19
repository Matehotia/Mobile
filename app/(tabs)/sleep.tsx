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
    
    // Convertir en minutes depuis minuit
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    // Si l'heure de fin est avant l'heure de début, on ajoute 24h
    let duration = endTotalMinutes - startTotalMinutes;
    if (duration < 0) {
      duration += 24 * 60; // Ajouter 24h en minutes
    }
    
    return duration;
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
          quality: quality
        }),
      });

      if (response.ok) {
        // Mettre à jour les statistiques globales
        await fetch('http://172.20.10.2:3000/update-stats', {
          method: 'POST',
        });
        
        fetchSleepData(); // Rafraîchir les données locales
        Alert.alert('Succès', 'Sommeil enregistré !');
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', "Impossible d'enregistrer le sommeil");
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
          <ThemedText style={styles.title}>Suivi du Sommeil</ThemedText>
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
              <ThemedText style={styles.historyDetails}>
                {record.sleep_start.slice(0, 5)} → {record.sleep_end.slice(0, 5)}
              </ThemedText>
              <ThemedText style={styles.historyQuality}>
                Qualité: {record.quality}/5
              </ThemedText>
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
            <ThemedView style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Nouveau sommeil</ThemedText>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <AntDesign name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Heure de coucher:</ThemedText>
              <TextInput
                style={styles.input}
                value={newSleep.sleep_start}
                onChangeText={(text) => setNewSleep({...newSleep, sleep_start: text})}
                placeholder="23:00"
              />
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Heure de réveil:</ThemedText>
              <TextInput
                style={styles.input}
                value={newSleep.sleep_end}
                onChangeText={(text) => setNewSleep({...newSleep, sleep_end: text})}
                placeholder="07:00"
              />
            </ThemedView>

            <ThemedView style={styles.qualityContainer}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.qualityButton, newSleep.quality === num && styles.qualityButtonSelected]}
                  onPress={() => setNewSleep({...newSleep, quality: num})}
                >
                  <ThemedText style={[styles.qualityText, newSleep.quality === num && styles.qualityTextSelected]}>
                    {num}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSleep}>
              <ThemedText style={styles.saveButtonText}>Enregistrer</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#60a5fa',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#60a5fa',
  },
  graphContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  historyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  historyDate: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  historyDetails: {
    flex: 1,
    marginLeft: 15,
  },
  historyTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  historyQuality: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualityText: {
    fontSize: 14,
    color: '#60a5fa',
    marginRight: 5,
  },
  qualityTextSelected: {
    color: '#ffffff',
    fontSize: 16,
  },
  qualityStars: {
    color: '#fbbf24',
  },
  noHistory: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
    marginTop: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#60a5fa',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  qualityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  qualityButton: {
    flex: 1,
    padding: 10,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  qualityButtonSelected: {
    backgroundColor: '#60a5fa',
  },
  qualityButtonText: {
    fontSize: 16,
    color: '#4b5563',
  },
  qualityButtonTextSelected: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#60a5fa',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  graph: {
    marginVertical: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
});