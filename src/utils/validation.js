// src/utils/validation.js
import { DEFAULTS } from './constants';

/**
 * Validates phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false;
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Check length
  return (
    digits.length >= DEFAULTS.MIN_PHONE_LENGTH &&
    digits.length <= DEFAULTS.MAX_PHONE_LENGTH
  );
};

/**
 * Validates interval value
 * @param {string|number} interval - Interval to validate
 * @returns {boolean} - True if valid
 */
export const validateInterval = (interval) => {
  const intervalNum = parseInt(interval);
  
  return (
    !isNaN(intervalNum) &&
    intervalNum >= DEFAULTS.MIN_INTERVAL &&
    intervalNum <= DEFAULTS.MAX_INTERVAL
  );
};

/**
 * Validates PIN format
 * @param {string} pin - PIN to validate
 * @returns {boolean} - True if valid
 */
export const validatePin = (pin) => {
  return (
    pin &&
    pin.length === DEFAULTS.PIN_LENGTH &&
    /^\d+$/.test(pin)
  );
};

/**
 * Formats phone number for display
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  const digits = phoneNumber.replace(/\D/g, '');
  
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return `+${digits.slice(0, digits.length - 10)} ${digits.slice(-10, -7)}-${digits.slice(-7, -4)}-${digits.slice(-4)}`;
};

/**
 * Sanitizes phone number (removes formatting)
 * @param {string} phoneNumber - Formatted phone number
 * @returns {string} - Clean phone number
 */
export const sanitizePhoneNumber = (phoneNumber) => {
  return phoneNumber.replace(/\D/g, '');
};