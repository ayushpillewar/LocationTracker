// src/utils/constants.js

// Storage Keys
export const STORAGE_KEYS = {
  PARENTAL_PIN: '@parental_pin',
  PHONE_NUMBER: '@phone_number',
  INTERVAL: '@interval',
  TRACKING_ACTIVE: '@tracking_active',
  TRACKING_PHONE: '@tracking_phone',
  TRACKING_INTERVAL: '@tracking_interval',
};

// Default Values
export const DEFAULTS = {
  PIN: '1234',
  INTERVAL: '5',
  MIN_INTERVAL: 1,
  MAX_INTERVAL: 60,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  PIN_LENGTH: 4,
};

// Colors
export const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  // Neutrals
  dark: '#1e293b',
  darkGray: '#475569',
  gray: '#64748b',
  lightGray: '#94a3b8',
  border: '#cbd5e1',
  light: '#e2e8f0',
  background: '#f8fafc',
  white: '#ffffff',
  
  // Status
  activeDot: '#10b981',
  inactiveDot: '#cbd5e1',
};

// Messages
export const MESSAGES = {
  PIN_INCORRECT: 'Incorrect PIN',
  PIN_SET_SUCCESS: 'PIN set successfully!',
  TRACKING_STARTED: 'Location tracking started',
  TRACKING_STOPPED: 'Location tracking stopped',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_INTERVAL: 'Interval must be between 1 and 60 minutes',
  PERMISSIONS_REQUIRED: 'Location and SMS permissions are required for tracking',
  ERROR_STARTING: 'Failed to start tracking',
  STOP_CONFIRM_TITLE: 'Stop Tracking',
  STOP_CONFIRM_MESSAGE: 'Are you sure you want to stop location tracking?',
};

// Location Options
export const LOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 1000,
  distanceFilter: 0,
};

// Animation Durations
export const ANIMATION = {
  SHAKE_DURATION: 50,
  PIN_VERIFY_DELAY: 100,
  SUCCESS_MESSAGE_DURATION: 2000,
};