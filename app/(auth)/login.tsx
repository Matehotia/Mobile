import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://172.20.10.4:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Réponse:', response);
      const data = await response.json();
      
      if (data.success) {
        login();
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erreur', 'Identifiants incorrects');
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      Alert.alert('Erreur', 'Impossible de se connecter au serveur');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.card}>
        <ThemedText style={styles.title}></ThemedText>
        <ThemedText style={styles.subtitle}>Connectez-vous pour continuer</ThemedText>
        
        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#9ca3af"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#9ca3af"
          />
        </ThemedView>
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <ThemedText style={styles.loginButtonText}>Se connecter</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  input: {
    height: 50,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loginButton: {
    backgroundColor: '#60a5fa',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#60a5fa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});