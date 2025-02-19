import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';

type UserProfile = {
  username: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
};

type UserStats = {
  total_sleep_hours: number;
  average_quality: number;
  planned_events: number;
  completed_events: number;
};

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 5000); // Rafraîchir toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://172.20.10.2:3000/profile');
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://172.20.10.2:3000/user-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      const response = await fetch('http://172.20.10.2:3000/upload-avatar', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        fetchProfile();
        Alert.alert('Succès', 'Photo de profil mise à jour !');
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', "Impossible de mettre à jour la photo de profil");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Photo de profil */}
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <ThemedView style={styles.avatarPlaceholder}>
              <AntDesign name="user" size={50} color="#666" />
            </ThemedView>
          )}
          <ThemedView style={styles.editBadge}>
            <AntDesign name="camera" size={20} color="white" />
          </ThemedView>
        </TouchableOpacity>

        {/* Informations du profil */}
        <ThemedView style={styles.infoContainer}>
          <ThemedText style={styles.username}>{profile?.username}</ThemedText>
          <ThemedText style={styles.email}>{profile?.email}</ThemedText>
          <ThemedText style={styles.joinDate}>
            Membre depuis {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : ''}
          </ThemedText>
        </ThemedView>

        {/* Statistiques */}
        <ThemedView style={styles.statsContainer}>
          <ThemedText style={styles.sectionTitle}>Statistiques</ThemedText>
          <ThemedView style={styles.statsGrid}>
            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statValue}>
                {stats?.total_sleep_hours !== undefined ? `${stats.total_sleep_hours}h` : '0h'}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Sommeil total</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statValue}>
                {stats?.average_quality !== undefined ? `${stats.average_quality.toFixed(1)}/5` : '0/5'}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Qualité moyenne</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statValue}>
                {stats?.planned_events || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Événements planifiés</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statValue}>
                {stats?.completed_events || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Événements terminés</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Bouton de déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutText}>Déconnexion</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5e7eb',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: '32%',
    backgroundColor: '#60a5fa',
    padding: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 10,
    textAlign: 'center',
  },
  joinDate: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1f2937',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#60a5fa',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});