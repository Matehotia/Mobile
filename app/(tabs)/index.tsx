import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useEffect, useState } from 'react';

// Types pour nos données
type SleepRecord = {
  sleep_date: string;
  sleep_start: string;
  sleep_end: string;
  quality: number;
};

type AgendaEvent = {
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  event_type: string;
};

export default function HomeScreen() {
  const [todayEvents, setTodayEvents] = useState<AgendaEvent[]>([]);
  const [lastSleep, setLastSleep] = useState<SleepRecord | null>(null);

  useEffect(() => {
    fetchTodayData();
  }, []);

  const fetchTodayData = async () => {
    try {
      const eventsResponse = await fetch('http://172.60.250.78:3000/today-events');
      const eventsData = await eventsResponse.json();
      console.log('Events received:', eventsData); // Pour debug
      setTodayEvents(eventsData);

      const sleepResponse = await fetch('http://172.60.250.78:3000/last-sleep');
      const sleepData = await sleepResponse.json();
      setLastSleep(sleepData);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Calculer la durée du sommeil
  const calculateSleepDuration = (start: string, end: string) => {
    try {
      const [startHours, startMinutes] = start.split(':').map(Number);
      const [endHours, endMinutes] = end.split(':').map(Number);
      
      let hours = endHours - startHours;
      let minutes = endMinutes - startMinutes;
      
      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }
      if (hours < 0) {
        hours += 24;
      }
      
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      return 'N/A';
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Convertit "23:00:00" en "23:00"
  };

  return (
    <ScrollView style={styles.container}>
      {/* En-tête */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Bonjour!</ThemedText>
        <ThemedText>Voici votre résumé du jour</ThemedText>
      </ThemedView>

      {/* Section sommeil avec plus de détails */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Dernière nuit</ThemedText>
        {lastSleep ? (
          <ThemedView style={styles.card}>
            <ThemedView style={styles.sleepDetail}>
              <ThemedView style={styles.sleepTime}>
                <ThemedText style={styles.sleepLabel}>Couché</ThemedText>
                <ThemedText style={styles.timeText}>{formatTime(lastSleep.sleep_start)}</ThemedText>
              </ThemedView>
              <ThemedText style={styles.sleepArrow}>→</ThemedText>
              <ThemedView style={styles.sleepTime}>
                <ThemedText style={styles.sleepLabel}>Réveil</ThemedText>
                <ThemedText style={styles.timeText}>{formatTime(lastSleep.sleep_end)}</ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.sleepStats}>
              <ThemedText style={styles.duration}>
                Durée: {calculateSleepDuration(lastSleep.sleep_start, lastSleep.sleep_end)}
              </ThemedText>
              <ThemedText style={styles.quality}>
                Qualité: {lastSleep.quality}/5 {lastSleep.quality >= 4 ? '😊' : lastSleep.quality >= 3 ? '😐' : '😴'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        ) : (
          <ThemedView style={styles.card}>
            <ThemedText>Aucune donnée de sommeil</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Section Agenda */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Prochains événements</ThemedText>
        <ThemedView style={styles.card}>
          {todayEvents && todayEvents.length > 0 ? (
            todayEvents.map((event, index) => (
              <ThemedView key={index} style={styles.eventItem}>
                <ThemedText type="defaultSemiBold">{event.title}</ThemedText>
                <ThemedText>
                  {new Date(event.event_date).toLocaleDateString('fr-FR')} - {event.start_time.slice(0, 5)} à {event.end_time.slice(0, 5)}
                </ThemedText>
                <ThemedText style={styles.eventType}>
                  {event.event_type === 'exam' ? '📝 Examen' : '📚 Révision'}
                </ThemedText>
              </ThemedView>
            ))
          ) : (
            <ThemedText>Aucun événement prévu</ThemedText>
          )}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    gap: 8,
  },
  section: {
    padding: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  eventItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 4,
  },
  eventType: {
    fontSize: 12,
    color: '#666',
  },
  sleepDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  sleepTime: {
    alignItems: 'center',
    flex: 1,
  },
  sleepLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sleepArrow: {
    fontSize: 24,
    marginHorizontal: 10,
    color: '#666',
  },
  sleepStats: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  duration: {
    fontSize: 16,
  },
  quality: {
    fontSize: 16,
  },
});