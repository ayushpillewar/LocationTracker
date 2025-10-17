import { useState, useEffect } from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextInput, Button, Surface } from 'react-native-paper';
import { styles } from './styles';

const DEFAULT_PIN = '1234'; // Default PIN for demonstration
const PIN_STORAGE_KEY = 'parental_pin';

export default function PinLockScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [storedPin, setStoredPin] = useState(DEFAULT_PIN);

  useEffect(() => {
    loadStoredPin();
  }, []);

  const loadStoredPin = async () => {
    try {
      const savedPin = await AsyncStorage.getItem(PIN_STORAGE_KEY);
      if (savedPin) {
        setStoredPin(savedPin);
      }
    } catch (error) {
      console.error('Error loading PIN:', error);
    }
  };

  const handlePinSubmit = () => {
    if (pin === storedPin) {
      setError('');
      router.push('/(tabs)/explore');
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  return (
    <ImageBackground 
      source={require('@/assets/images/home_image.jpg')}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <ThemedView style={styles.container}>
        <Surface style={styles.surface}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Parental Control</ThemedText>
          </ThemedView>

          <TextInput
            style={styles.input}
            mode="outlined"
            label="Enter PIN"
            value={pin}
            onChangeText={setPin}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            error={!!error}
          />

          {error ? (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          ) : null}

          <Button
            mode="contained"
            onPress={handlePinSubmit}
            style={styles.button}
            disabled={pin.length !== 4}
          >
            Unlock
          </Button>
        </Surface>
      </ThemedView>
    </ImageBackground>
  );
}