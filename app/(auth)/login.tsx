import { useAuth } from '../../context/AuthContext';

import { useState } from 'react';
import { StyleSheet, TextInput, Button, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://172.20.10.2:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        login(); // Met à jour le contexte d'authentification
        router.replace('/'); // Redirige vers la page d'accueil
      } else {
        Alert.alert('Erreur', 'Identifiants incorrects');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Connexion</ThemedText>
      
      <TextInput
        style={styles.input}
        placeholder="Nom d'utilisateur"
        value={username}
        onChangeText={setUsername}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button title="Se connecter" onPress={handleLogin} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
}); 