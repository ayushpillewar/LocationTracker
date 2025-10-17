import { useState, useEffect } from 'react';
import { StyleSheet, Alert, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextInput, Button, Surface } from 'react-native-paper';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as SMS from 'expo-sms';

const LOCATION_TRACKING = 'location-tracking';

export default function LocationTrackerScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [interval, setInterval] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState('');

  const requestPermissions = async () => {
    try {
      // First request foreground permission
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        setError('Location permission is required');
        return false;
      }

      // On Android, we need to explicitly request background permission
      if (Platform.OS === 'android') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          Alert.alert(
            'Background Location Required',
            'This app needs background location access to send location updates. Please enable it in your settings.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setError('Background location permission is required')
              },
              {
                text: 'Open Settings',
                onPress: () => Location.openSettings()
              }
            ]
          );
          return false;
        }
      }
      return true;
    } catch (err) {
      setError('Error requesting permissions');
      console.error(err);
      return false;
    }
  };

  const startTracking = async () => {
    try {
      const permissionsGranted = await requestPermissions();
      if (!permissionsGranted) {
        return;
      }

      // Ask for user confirmation
      Alert.alert(
        'Start Location Tracking',
        `This will send your location to ${phoneNumber} every ${interval} seconds. Continue?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Start',
            onPress: async () => {
              try {
                await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
                  interval: parseInt(interval) * 1000,
                  accuracy: Location.Accuracy.High,
                  // Enable background tracking
                  foregroundService: {
                    notificationTitle: 'Location Tracking Active',
                    notificationBody: 'Sending location updates in background',
                  },
                  // Ensure background tracking works
                  activityType: Location.ActivityType.Other,
                  showsBackgroundLocationIndicator: true,
                });
                setIsTracking(true);
                setError('');
              } catch (err) {
                setError('Failed to start location tracking');
                console.error(err);
              }
            },
          },
        ]
      );
    } catch (err) {
      setError('Failed to start location tracking');
      console.error(err);
    }
  };

  const stopTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      setIsTracking(false);
      setError('');
    } catch (err) {
      setError('Failed to stop location tracking');
      console.error(err);
    }
  };

  // Define the background task for location tracking
  TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      const { locations } = data;
      const location = locations[0];
      if (location) {
        try {
          const message = `Current Location:\nLatitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}`;
          await SMS.sendSMSAsync([phoneNumber], message);
        } catch (err) {
          console.error('Error sending SMS:', err);
        }
      }
    }
  });

  // Check permissions when component mounts
  useEffect(() => {
    (async () => {
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();

      if (foregroundStatus !== 'granted' || backgroundStatus !== 'granted') {
        setError('Location permissions are required for tracking');
      }
    })();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Surface style={styles.surface}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Location Tracker</ThemedText>
        </ThemedView>

        <TextInput
          style={styles.input}
          mode="outlined"
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          disabled={isTracking}
        />

        <TextInput
          style={styles.input}
          mode="outlined"
          label="Interval (seconds)"
          value={interval}
          onChangeText={setInterval}
          keyboardType="numeric"
          disabled={isTracking}
        />

        {error ? (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        ) : null}

        <ThemedView style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={startTracking}
            style={[styles.button, styles.startButton]}
            disabled={!phoneNumber || !interval || isTracking}
          >
            Start Tracking
          </Button>

          <Button
            mode="contained"
            onPress={stopTracking}
            style={[styles.button, styles.stopButton]}
            disabled={!isTracking}
          >
            Stop Tracking
          </Button>
        </ThemedView>

        {isTracking && (
          <ThemedText style={styles.statusText}>
            Currently tracking location and sending updates to {phoneNumber} every {interval} seconds
          </ThemedText>
        )}
      </Surface>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    margin: 5,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  errorText: {
    color: '#ff3333',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#4CAF50',
  },
});
