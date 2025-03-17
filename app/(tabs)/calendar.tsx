import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Platform } from 'react-native';
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
  is_completed: boolean;
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
      const response = await fetch(`http://172.20.10.4:3000/events`);
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

      const response = await fetch('http://172.20.10.4:3000/events', {
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
      setNewEvent(prev => ({...prev, event_date: formattedDate}));
    }
  };

  const toggleEventCompletion = async (eventId: number, completed: boolean) => {
    try {
      const response = await fetch(`http://172.20.10.4:3000/events/${eventId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_completed: completed }),
      });

      if (response.ok) {
        fetchEvents();
        // Mettre à jour les statistiques
        await fetch('http://172.20.10.4:3000/update-stats', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', "Impossible de mettre à jour l'événement");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Calendrier</ThemedText>
      </ThemedView>
      <ThemedView style={styles.calendarContainer}>
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
            selectedDayBackgroundColor: '#60a5fa',
            todayTextColor: '#60a5fa',
            arrowColor: '#60a5fa',
            monthTextColor: '#1f2937',
            textMonthFontSize: 16,
            textDayFontSize: 14,
            textDayHeaderFontSize: 14,
            'stylesheet.calendar.header': {
              week: {
                marginTop: 2,
                marginBottom: 2,
                flexDirection: 'row',
                justifyContent: 'space-around'
              },
              monthText: {
                margin: 5
              }
            }
          }}
        />
      </ThemedView>
      <ScrollView style={styles.eventsList}>
        <ThemedText style={styles.dateTitle}>
          {new Date(selectedDate).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </ThemedText>

        {getEventsForSelectedDate().length > 0 ? (
          getEventsForSelectedDate().map((event, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.eventCard,
                event.is_completed && styles.completedEvent
              ]}
            >
              <ThemedView style={styles.eventHeader}>
                <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
                <TouchableOpacity 
                  onPress={() => toggleEventCompletion(event.id, !event.is_completed)}
                  style={styles.completeButton}
                >
                  <AntDesign 
                    name={event.is_completed ? "checkcircle" : "checkcircleo"} 
                    size={24} 
                    color={event.is_completed ? "#4CD964" : "#999"} 
                  />
                </TouchableOpacity>
              </ThemedView>
              <ThemedText style={styles.eventTime}>
                {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
              </ThemedText>
              {event.description && (
                <ThemedText style={styles.eventDescription}>
                  {event.description}
                </ThemedText>
              )}
              <ThemedView style={styles.eventMeta}>
                <ThemedText style={[styles.eventType, { color: event.event_type === 'exam' ? '#FF3B30' : '#007AFF' }]}>
                  {event.event_type === 'exam' ? '📝 Examen' : '📚 Révision'}
                </ThemedText>
                <ThemedText style={styles.priority}>
                  {'⭐'.repeat(event.priority)}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
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

            {Platform.OS === 'android' ? (
              showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={new Date(newEvent.event_date)}
                  mode="date"
                  onChange={handleDateChange}
                />
              )
            ) : (
              <DateTimePicker
                testID="dateTimePicker"
                value={new Date(newEvent.event_date)}
                mode="date"
                onChange={handleDateChange}
                display="default"
                style={{ display: showDatePicker ? 'flex' : 'none' }}
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
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    margin: 10,
    marginBottom: 5,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  eventsList: {
    padding: 20,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textTransform: 'capitalize',
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  eventType: {
    fontSize: 14,
    color: '#60a5fa',
    fontWeight: '600',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  eventTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  priority: {
    fontSize: 14,
    color: '#6b7280',
  },
  noEvents: {
    padding: 20,
    alignItems: 'center',
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
    minHeight: '70%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  saveButton: {
    backgroundColor: '#60a5fa',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  completedEvent: {
    opacity: 0.6,
  },
  completeButton: {
    padding: 5,
  }
});