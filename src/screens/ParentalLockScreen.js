// src/screens/ParentalLockScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const STORAGE_KEY = '@parental_pin';
const DEFAULT_PIN = '1234';

const ParentalLockScreen = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState(DEFAULT_PIN);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [error, setError] = useState('');
  const shakeAnimation = new Animated.Value(0);

  useEffect(() => {
    loadPin();
  }, []);

  const loadPin = async () => {
    try {
      const savedPin = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedPin) {
        setStoredPin(savedPin);
      }
    } catch (e) {
      console.error('Error loading PIN:', e);
    }
  };

  const savePin = async (newPin) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newPin);
      setStoredPin(newPin);
    } catch (e) {
      console.error('Error saving PIN:', e);
    }
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleNumberPress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');

      if (newPin.length === 4) {
        setTimeout(() => verifyPin(newPin), 100);
      }
    }
  };

  const verifyPin = async (enteredPin) => {
    if (isSettingPin) {
      await savePin(enteredPin);
      setIsSettingPin(false);
      setPin('');
      setError('PIN set successfully!');
      setTimeout(() => setError(''), 2000);
    } else {
      if (enteredPin === storedPin) {
        navigation.navigate('LocationTracker');
        setPin('');
      } else {
        setError('Incorrect PIN');
        Vibration.vibrate(500);
        shake();
        setPin('');
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const toggleSetPin = () => {
    setIsSettingPin(!isSettingPin);
    setPin('');
    setError('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="shield-lock" size={80} color="#6366f1" />
        <Text style={styles.title}>Parental Lock</Text>
        <Text style={styles.subtitle}>
          {isSettingPin ? 'Set New 4-Digit PIN' : 'Enter 4-Digit PIN'}
        </Text>
      </View>

      <Animated.View
        style={[
          styles.pinContainer,
          { transform: [{ translateX: shakeAnimation }] },
        ]}
      >
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.pinDot,
              pin.length > i && styles.pinDotFilled,
            ]}
          />
        ))}
      </Animated.View>

      {error ? (
        <Text style={[styles.error, error.includes('success') && styles.success]}>
          {error}
        </Text>
      ) : null}

      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.key}
            onPress={() => handleNumberPress(num.toString())}
            activeOpacity={0.7}
          >
            <Text style={styles.keyText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.key}
          onPress={toggleSetPin}
          activeOpacity={0.7}
        >
          <Icon name="cog" size={28} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.key}
          onPress={() => handleNumberPress('0')}
          activeOpacity={0.7}
        >
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.key}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Icon name="backspace-outline" size={28} color="#64748b" />
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Default PIN: 1234</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginHorizontal: 10,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 20,
    fontWeight: '600',
  },
  success: {
    color: '#10b981',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 300,
    justifyContent: 'center',
  },
  key: {
    width: 80,
    height: 80,
    margin: 8,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1e293b',
  },
  hint: {
    marginTop: 30,
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default ParentalLockScreen;