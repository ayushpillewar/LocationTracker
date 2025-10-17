// src/utils/permissions.js
import { PermissionsAndroid, Platform, Alert } from 'react-native';

/**
 * Request all required permissions for location tracking
 * @returns {Promise<boolean>} - True if all permissions granted
 */
export const requestLocationPermissions = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ];

    // For Android 10+, request background location separately
    if (Platform.Version >= 29) {
      const foregroundGranted = await PermissionsAndroid.requestMultiple(permissions);
      
      if (
        foregroundGranted['android.permission.ACCESS_FINE_LOCATION'] === 'granted' &&
        foregroundGranted['android.permission.ACCESS_COARSE_LOCATION'] === 'granted'
      ) {
        // Now request background permission
        const backgroundGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Background Location Permission',
            message: 'This app needs background location access to track your location when the app is closed.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        return backgroundGranted === 'granted';
      }
      
      return false;
    }

    // For Android 9 and below
    const granted = await PermissionsAndroid.requestMultiple(permissions);
    
    return (
      granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted' &&
      granted['android.permission.ACCESS_COARSE_LOCATION'] === 'granted'
    );
  } catch (err) {
    console.error('Permission error:', err);
    return false;
  }
};

/**
 * Request SMS permission
 * @returns {Promise<boolean>} - True if permission granted
 */
export const requestSmsPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.SEND_SMS,
      {
        title: 'SMS Permission',
        message: 'This app needs SMS permission to send location updates.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('SMS permission error:', err);
    return false;
  }
};

/**
 * Request all required permissions
 * @returns {Promise<boolean>} - True if all permissions granted
 */
export const requestAllPermissions = async () => {
  const locationGranted = await requestLocationPermissions();
  
  if (!locationGranted) {
    Alert.alert(
      'Location Permission Required',
      'Location access is required for tracking. Please enable it in settings.',
      [{ text: 'OK' }]
    );
    return false;
  }

  const smsGranted = await requestSmsPermission();
  
  if (!smsGranted) {
    Alert.alert(
      'SMS Permission Required',
      'SMS permission is required to send location updates. Please enable it in settings.',
      [{ text: 'OK' }]
    );
    return false;
  }

  return true;
};

/**
 * Check if location permissions are granted
 * @returns {Promise<boolean>} - True if granted
 */
export const checkLocationPermissions = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const fineLocation = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    
    const coarseLocation = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
    );

    return fineLocation && coarseLocation;
  } catch (err) {
    console.error('Error checking permissions:', err);
    return false;
  }
};

/**
 * Check if SMS permission is granted
 * @returns {Promise<boolean>} - True if granted
 */
export const checkSmsPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    return await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.SEND_SMS
    );
  } catch (err) {
    console.error('Error checking SMS permission:', err);
    return false;
  }
};