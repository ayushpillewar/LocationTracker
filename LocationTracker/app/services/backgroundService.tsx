import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For Android direct SMS sending
let SmsAndroid: any = null;
if (Platform.OS === 'android') {
  try {
    SmsAndroid = require('react-native-sms-android');
  } catch (error) {
    console.warn('SMS Android not available:', error);
  }
}

const LOCATION_TASK_NAME = 'background-location-task';
const STORAGE_KEY = 'location_service_config';

interface LocationServiceConfig {
  contactNumber: string;
  interval: number;
  isActive: boolean;
}

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as any;
    const location = locations[0];
    
    if (location) {
      try {
        // Get stored configuration
        const configString = await AsyncStorage.getItem(STORAGE_KEY);
        if (configString) {
          const config: LocationServiceConfig = JSON.parse(configString);
          
          if (config.isActive && config.contactNumber) {
            const message = `Current Location: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}
Accuracy: ${location.coords.accuracy}m
Time: ${new Date(location.timestamp).toLocaleString()}`;

            // Send SMS directly without opening SMS app
            try {
              if (Platform.OS === 'android' && SmsAndroid) {
                // Use react-native-sms-android for direct sending on Android
                await new Promise((resolve, reject) => {
                  SmsAndroid.autoSend(
                    config.contactNumber,
                    message,
                    (fail: any) => {
                      console.error('Failed to send SMS:', fail);
                      reject(fail);
                    },
                    (success: any) => {
                      console.log('SMS sent successfully:', success);
                      resolve(success);
                    }
                  );
                });
              } else {
                // Fallback for iOS or if Android SMS not available
                console.log('SMS sending not available on this platform or SMS library not found');
                // You could implement a web service call here as an alternative
              }
            } catch (smsError) {
              console.error('Error sending SMS:', smsError);
            }
          }
        }
      } catch (error) {
        console.error('Error sending location SMS:', error);
      }
    }
  }
});

export class LocationService {
  static async startLocationUpdates(contactNumber: string, intervalMinutes: number): Promise<boolean> {
    try {
      // Request permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        throw new Error('Foreground location permission not granted');
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        throw new Error('Background location permission not granted');
      }

      // Store configuration
      const config: LocationServiceConfig = {
        contactNumber,
        interval: intervalMinutes,
        isActive: true
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));

      // Start location updates
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: intervalMinutes * 60 * 1000, // Convert minutes to milliseconds
        distanceInterval: 10, // Send update every 10 meters
        foregroundService: {
          notificationTitle: 'Location Tracker',
          notificationBody: 'Tracking location in background',
        },
      });

      return true;
    } catch (error) {
      console.error('Error starting location updates:', error);
      return false;
    }
  }

  static async stopLocationUpdates(): Promise<boolean> {
    try {
      // Update configuration
      const configString = await AsyncStorage.getItem(STORAGE_KEY);
      if (configString) {
        const config: LocationServiceConfig = JSON.parse(configString);
        config.isActive = false;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      }

      // Stop location updates
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      return true;
    } catch (error) {
      console.error('Error stopping location updates:', error);
      return false;
    }
  }

  static async isLocationUpdateActive(): Promise<boolean> {
    try {
      const configString = await AsyncStorage.getItem(STORAGE_KEY);
      if (configString) {
        const config: LocationServiceConfig = JSON.parse(configString);
        return config.isActive;
      }
      return false;
    } catch (error) {
      console.error('Error checking location update status:', error);
      return false;
    }
  }

  static async sendTestSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && SmsAndroid) {
        await new Promise((resolve, reject) => {
          SmsAndroid.autoSend(
            phoneNumber,
            message,
            (fail: any) => {
              console.error('Failed to send test SMS:', fail);
              reject(fail);
            },
            (success: any) => {
              console.log('Test SMS sent successfully:', success);
              resolve(success);
            }
          );
        });
        return true;
      } else {
        console.log('SMS sending not available on this platform');
        return false;
      }
    } catch (error) {
      console.error('Error sending test SMS:', error);
      return false;
    }
  }

  static async getStoredConfig(): Promise<LocationServiceConfig | null> {
    try {
      const configString = await AsyncStorage.getItem(STORAGE_KEY);
      if (configString) {
        return JSON.parse(configString);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored config:', error);
      return null;
    }
  }
}
