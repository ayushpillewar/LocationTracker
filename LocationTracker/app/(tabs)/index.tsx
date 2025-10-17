import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextInput, Button, Surface } from 'react-native-paper';

const DEFAULT_PIN = '1234'; // Default PIN for demonstration

export default function PinLockScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handlePinSubmit = () => {
    if (pin === DEFAULT_PIN) {
      setError('');
      router.push('/(tabs)/explore');
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 20,
    elevation: 4,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  errorText: {
    color: '#ff3333',
    textAlign: 'center',
    marginBottom: 8,
  },
});
