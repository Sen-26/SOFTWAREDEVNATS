// app/register.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useAuth } from './_layout';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password || !confirm) {
      Alert.alert('Missing Fields', 'All fields are required.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      // Call backend API for registration
      const response = await fetch('http://192.168.193.45:5431/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        Alert.alert('Registration Failed', error?.message || 'Could not register.');
        setLoading(false);
        return;
      }
      // Optionally, auto-login after registration
      const data = await response.json();
      if (!data.token) {
        // If registration succeeded but no token, try logging in
        const loginResp = await fetch('http://192.168.193.45:5431/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (!loginResp.ok) {
          Alert.alert('Registration Succeeded', 'But could not log in automatically. Please log in manually.');
          setLoading(false);
          return;
        }
        const loginData = await loginResp.json();
        await login(loginData.token);
      } else {
        await login(data.token);
      }
      router.replace('/');
    } catch (err) {
      console.error('Registration error:', err);
      Alert.alert('Error', 'Could not complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.background}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/login')}
        >
          <Ionicons name="arrow-back" size={24} color="#2C7A7B" />
        </TouchableOpacity>
        <View style={styles.card}>
          <Ionicons
            name="person-add-outline"
            size={64}
            color="#28a745"
            style={styles.logo}
          />
          <Text style={styles.subtitle}>Join Skoup — make a difference today.</Text>
          <Text style={styles.title}>Create Account</Text>
          <TextInput
            placeholder="Username"
            placeholderTextColor="#A0AEC0"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#A0AEC0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#A0AEC0"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#E6FFFA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 24,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C7A7B',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
    fontSize: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#2C7A7B',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});