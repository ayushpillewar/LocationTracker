// src/screens/LocationTrackerScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationService } from '../services/LocationService';

const STORAGE_KEYS = {
  PHONE: '@phone_number',
  INTERVAL: '@interval',
};

const LocationTrackerScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [interval, setInterval] = useState('5');
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadSettings();
    checkTrackingStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const savedPhone = await AsyncStorage.getItem(STORAGE_KEYS.PHONE);
      const savedInterval = await AsyncStorage.getItem(STORAGE_KEYS.INTERVAL);
      
      if (savedPhone) setPhoneNumber(savedPhone);
      if (savedInterval) setInterval(savedInterval);
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PHONE, phoneNumber);
      await AsyncStorage.setItem(STORAGE_KEYS.INTERVAL, interval);
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  };

  const checkTrackingStatus = async () => {
    const status = await LocationService.isTracking();
    setIsTracking(status);
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
        ]);

        return (
          granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted' &&
          granted['android.permission.SEND_SMS'] === 'granted'
        );
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const validateInputs = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Input', 'Please enter a valid phone number');
      return false;
    }

    const intervalNum = parseInt(interval);
    if (!intervalNum || intervalNum < 1 || intervalNum > 60) {
      Alert.alert('Invalid Input', 'Interval must be between 1 and 60 minutes');
      return false;
    }

    return true;
  };

  const handleStart = async () => {
    if (!validateInputs()) return;

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      Alert.alert(
        'Permissions Required',
        'Location and SMS permissions are required for tracking'
      );
      return;
    }

    await saveSettings();

    const started = await LocationService.startTracking(
      phoneNumber,
      parseInt(interval),
      (location) => {
        setLastUpdate(new Date().toLocaleTimeString());
      }
    );

    if (started) {
      setIsTracking(true);
      Alert.alert('Success', 'Location tracking started');
    } else {
      Alert.alert('Error', 'Failed to start tracking');
    }
  };

  const handleStop = async () => {
    Alert.alert(
      'Stop Tracking',
      'Are you sure you want to stop location tracking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: async () => {
            await LocationService.stopTracking();
            setIsTracking(false);
            setLastUpdate(null);
            Alert.alert('Success', 'Location tracking stopped');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.title}>Location Tracker</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.statusCard}>
        <View style={[styles.statusDot, isTracking && styles.statusDotActive]} />
        <Text style={styles.statusText}>
          {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
        </Text>
      </View>

      {lastUpdate && (
        <View style={styles.updateCard}>
          <Icon name="clock-outline" size={20} color="#64748b" />
          <Text style={styles.updateText}>Last update: {lastUpdate}</Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Icon name="phone" size={16} color="#64748b" /> Phone Number
          </Text>
          <View style={styles.inputContainer}>
            <Icon
              name="phone-outline"
              size={20}
              color="#94a3b8"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#cbd5e1"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={15}
              editable={!isTracking}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Icon name="timer-outline" size={16} color="#64748b" /> Update Interval (minutes)
          </Text>
          <View style={styles.inputContainer}>
            <Icon
              name="timer-sand"
              size={20}
              color="#94a3b8"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter interval in minutes"
              placeholderTextColor="#cbd5e1"
              value={interval}
              onChangeText={setInterval}
              keyboardType="numeric"
              maxLength={2}
              editable={!isTracking}
            />
          </View>
          <Text style={styles.helperText}>
            Location will be sent every {interval || '0'} minute(s)
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {!isTracking ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Icon name="play-circle" size={24} color="#ffffff" />
            <Text style={styles.buttonText}>Start Tracking</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStop}
            activeOpacity={0.8}
          >
            <Icon name="stop-circle" size={24} color="#ffffff" />
            <Text style={styles.buttonText}>Stop Tracking</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoCard}>
        <Icon name="information" size={20} color="#6366f1" />
        <Text style={styles.infoText}>
          The app will send SMS messages with your location to the specified number
          at the set interval. Make sure you have SMS credits available.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#cbd5e1',
    marginRight: 12,
  },
  statusDotActive: {
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  updateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  updateText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
    marginLeft: 4,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    padding: 18,
    borderRadius: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    marginLeft: 12,
    lineHeight: 20,
  },
});

export default LocationTrackerScreen;