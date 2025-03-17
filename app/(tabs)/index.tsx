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
      const eventsResponse = await fetch('http://172.20.10.4:3000/today-events');
      const eventsData = await eventsResponse.json();
      console.log('Events received:', eventsData); // Pour debug
      setTodayEvents(eventsData);

      const sleepResponse = await fetch('http://172.20.10.4:3000/last-sleep');
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
        <ThemedText type="title" style={styles.welcomeText}>Bonjour!</ThemedText>
        <ThemedText style={styles.welcomeText}>Voici votre résumé du jour</ThemedText>
      </ThemedView>

      {/* Section sommeil avec plus de détails */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.subtitle}>Dernière nuit</ThemedText>
        {lastSleep ? (
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
        ) : (
          <ThemedView style={styles.card}>
            <ThemedText>Aucune donnée de sommeil</ThemedText>
          </ThemedView>
        )}
        {lastSleep && (
          <ThemedView style={styles.sleepStats}>
            <ThemedText style={styles.duration}>
              Durée: {calculateSleepDuration(lastSleep.sleep_start, lastSleep.sleep_end)}
            </ThemedText>
            <ThemedText style={styles.quality}>
              Qualité: {lastSleep.quality}/5 {lastSleep.quality >= 4 ? '😊' : lastSleep.quality >= 3 ? '😐' : '😴'}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Section Agenda */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Prochains événements</ThemedText>
        <ThemedView style={styles.card}>
          {todayEvents && todayEvents.length > 0 ? (
            todayEvents.map((event, index) => (
              <ThemedView key={index} style={styles.eventItem}>
                <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
                <ThemedText style={styles.eventDateTime}>
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
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#60a5fa',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  section: {
    padding: 20,
    gap: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sleepDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
  },
  sleepTime: {
    alignItems: 'center',
    flex: 1,
  },
  sleepLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#60a5fa',
  },
  sleepArrow: {
    fontSize: 24,
    marginHorizontal: 10,
    color: '#60a5fa',
  },
  sleepStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },
  duration: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '600',
  },
  quality: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '600',
  },
  eventItem: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 15,
    marginVertical: 6,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  eventDateTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 14,
    color: '#60a5fa',
    fontWeight: '600',
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTypeIcon: {
    marginRight: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
});