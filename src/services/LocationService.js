// src/services/LocationService.js
import Geolocation from '@react-native-community/geolocation';
import BackgroundTimer from 'react-native-background-timer';
import SmsAndroid from 'react-native-sms-android';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LocationServiceClass {
  constructor() {
    this.intervalId = null;
    this.phoneNumber = null;
    this.updateInterval = null;
    this.onLocationUpdate = null;
    this.isActive = false;
  }

  async startTracking(phoneNumber, intervalMinutes, callback) {
    try {
      this.phoneNumber = phoneNumber;
      this.updateInterval = intervalMinutes;
      this.onLocationUpdate = callback;
      this.isActive = true;

      // Save tracking state
      await AsyncStorage.setItem('@tracking_active', 'true');
      await AsyncStorage.setItem('@tracking_phone', phoneNumber);
      await AsyncStorage.setItem('@tracking_interval', intervalMinutes.toString());

      // Send initial location
      this.sendLocation();

      // Set up interval for periodic updates
      this.intervalId = BackgroundTimer.setInterval(() => {
        this.sendLocation();
      }, intervalMinutes * 60 * 1000);

      return true;
    } catch (error) {
      console.error('Error starting tracking:', error);
      return false;
    }
  }

  async stopTracking() {
    try {
      if (this.intervalId) {
        BackgroundTimer.clearInterval(this.intervalId);
        this.intervalId = null;
      }

      this.isActive = false;
      this.phoneNumber = null;
      this.updateInterval = null;
      this.onLocationUpdate = null;

      // Clear tracking state
      await AsyncStorage.removeItem('@tracking_active');
      await AsyncStorage.removeItem('@tracking_phone');
      await AsyncStorage.removeItem('@tracking_interval');

      return true;
    } catch (error) {
      console.error('Error stopping tracking:', error);
      return false;
    }
  }

  sendLocation() {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = new Date(position.timestamp).toLocaleString();

        const message = 
          `Location Update\n` +
          `Time: ${timestamp}\n` +
          `Lat: ${latitude.toFixed(6)}\n` +
          `Lon: ${longitude.toFixed(6)}\n` +
          `Accuracy: ${accuracy.toFixed(0)}m\n` +
          `Map: https://maps.google.com/?q=${latitude},${longitude}`;

        this.sendSMS(this.phoneNumber, message);

        if (this.onLocationUpdate) {
          this.onLocationUpdate({ latitude, longitude, accuracy, timestamp });
        }
      },
      (error) => {
        console.error('Location error:', error);
        
        // Send error notification
        if (this.phoneNumber) {
          this.sendSMS(
            this.phoneNumber,
            `Location Tracking Error: ${error.message}`
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      }
    );
  }

  sendSMS(phoneNumber, message) {
    try {
      SmsAndroid.autoSend(
        phoneNumber,
        message,
        (fail) => {
          console.error('SMS send failed:', fail);
        },
        (success) => {
          console.log('SMS sent successfully:', success);
        }
      );
    } catch (error) {
      console.error('SMS error:', error);
    }
  }

  async isTracking() {
    try {
      const active = await AsyncStorage.getItem('@tracking_active');
      return active === 'true';
    } catch (error) {
      console.error('Error checking tracking status:', error);
      return false;
    }
  }

  async restoreTracking() {
    try {
      const isActive = await this.isTracking();
      
      if (isActive) {
        const phone = await AsyncStorage.getItem('@tracking_phone');
        const interval = await AsyncStorage.getItem('@tracking_interval');
        
        if (phone && interval) {
          await this.startTracking(phone, parseInt(interval), null);
        }
      }
    } catch (error) {
      console.error('Error restoring tracking:', error);
    }
  }
}

export const LocationService = new LocationServiceClass();