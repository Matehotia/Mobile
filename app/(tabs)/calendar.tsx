import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

type Event = {
  id: number;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  event_type: string;
  priority: number;
};

type MarkedDates = {
  [key: string]: { marked: boolean; dotColor: string; selected?: boolean };
};

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<Event[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: selectedDate,
    start_time: '08:00',
    end_time: '09:00',
    event_type: 'revision',
    priority: 1
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`http://172.20.10.2:3000/events`);
      const data = await response.json();
      setEvents(data);
      
      const marks: MarkedDates = {};
      data.forEach((event: Event) => {
        marks[event.event_date] = { marked: true, dotColor: '#007AFF' };
      });
      setMarkedDates(marks);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getEventsForSelectedDate = () => {
    return events.filter(event => event.event_date === selectedDate);
  };

  const handleAddEvent = async () => {
    try {
      if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
        return;
      }

      console.log('Envoi de données:', newEvent);

      const response = await fetch('http://172.20.10.2:3000/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description || '',
          event_date: newEvent.event_date,
          start_time: newEvent.start_time,
          end_time: newEvent.end_time,
          event_type: newEvent.event_type,
          priority: Number(newEvent.priority)
        }),
      });

      const responseText = await response.text();
      console.log('Réponse brute du serveur:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur de parsing JSON:', responseText);
        Alert.alert('Erreur', 'Le serveur a renvoyé une réponse invalide');
        return;
      }

      if (response.ok) {
        Alert.alert('Succès', 'Événement ajouté !');
        setModalVisible(false);
        fetchEvents();
      } else {
        Alert.alert('Erreur', `Impossible d'ajouter l'événement: ${data.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setNewEvent({...newEvent, event_date: formattedDate});
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Calendar
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            selected: true,
            marked: markedDates[selectedDate]?.marked,
            dotColor: markedDates[selectedDate]?.dotColor
          }
        }}
        theme={{
          selectedDayBackgroundColor: '#007AFF',
          todayTextColor: '#007AFF',
          arrowColor: '#007AFF',
        }}
      />

      <ScrollView style={styles.eventList}>
        <ThemedText style={styles.dateTitle}>
          {new Date(selectedDate).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </ThemedText>

        {getEventsForSelectedDate().length > 0 ? (
          getEventsForSelectedDate().map((event, index) => (
            <ThemedView key={index} style={styles.eventCard}>
              <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
              <ThemedText style={styles.eventTime}>
                {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
              </ThemedText>
              {event.description && (
                <ThemedText style={styles.eventDescription}>
                  {event.description}
                </ThemedText>
              )}
              <ThemedView style={styles.eventMeta}>
                <ThemedText style={[
                  styles.eventType,
                  { color: event.event_type === 'exam' ? '#FF3B30' : '#007AFF' }
                ]}>
                  {event.event_type === 'exam' ? '📝 Examen' : '📚 Révision'}
                </ThemedText>
                <ThemedText style={styles.priority}>
                  {'⭐'.repeat(event.priority)}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          ))
        ) : (
          <ThemedView style={styles.noEvents}>
            <ThemedText>Aucun événement ce jour</ThemedText>
          </ThemedView>
        )}
      </ScrollView>

      {/* Add floating button */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setModalVisible(true)}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Add event modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Nouvel événement</ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="Titre"
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({...newEvent, title: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newEvent.description}
              onChangeText={(text) => setNewEvent({...newEvent, description: text})}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Heure de début (HH:MM)"
              value={newEvent.start_time}
              onChangeText={(text) => setNewEvent({...newEvent, start_time: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Heure de fin (HH:MM)"
              value={newEvent.end_time}
              onChangeText={(text) => setNewEvent({...newEvent, end_time: text})}
            />

            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText>
                Date: {new Date(newEvent.event_date).toLocaleDateString('fr-FR')}
              </ThemedText>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date(newEvent.event_date)}
                mode="date"
                onChange={handleDateChange}
              />
            )}

            <ThemedView style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={styles.buttonText}>Annuler</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleAddEvent}
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
  },
  eventList: {
    flex: 1,
    padding: 15,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textTransform: 'capitalize',
  },
  eventCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventTime: {
    color: '#666',
    marginBottom: 5,
  },
  eventDescription: {
    marginBottom: 10,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventType: {
    fontSize: 12,
  },
  priority: {
    fontSize: 12,
  },
  noEvents: {
    padding: 20,
    alignItems: 'center',
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
    shadowOffset: { width: 0, height: 2 },
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
  },
}); 