import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, FlatList, Platform, PermissionsAndroid } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  TextInput, 
  Modal, 
  Portal, 
  List, 
  Chip, 
  Divider,
  IconButton 
} from 'react-native-paper';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import { LocationService } from '../services/backgroundService';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { styles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Contact {
  id: string;
  name: string;
  phoneNumbers?: { number: string; label?: string }[];
}

const PREDEFINED_INTERVALS = [5, 10, 15, 30, 60, 120]; // minutes
const PIN_STORAGE_KEY = 'parental_pin';

export default function ExploreScreen() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<number>(15);
  const [customInterval, setCustomInterval] = useState<string>('');
  const [isServiceActive, setIsServiceActive] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactModalVisible, setContactModalVisible] = useState<boolean>(false);
  const [pinModalVisible, setPinModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [currentPin, setCurrentPin] = useState<string>('');

  useEffect(() => {
    loadContacts();
    checkServiceStatus();
    loadStoredConfig();
    requestSMSPermissions();
  }, []);

  const requestSMSPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          {
            title: 'SMS Permission',
            message: 'LocationTracker needs SMS permission to send location updates automatically.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'SMS Permission Required',
            'SMS permission is required to send automatic location updates. Please enable it in app settings.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error requesting SMS permission:', error);
      }
    }
  };

  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });

        const formattedContacts: Contact[] = data
          .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
          .map(contact => ({
            id: contact.id || '',
            name: contact.name || 'Unknown',
            phoneNumbers: contact.phoneNumbers?.map(phone => ({
              number: phone.number || '',
              label: phone.label || 'mobile'
            }))
          }));

        setContacts(formattedContacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
    }
  };

  const checkServiceStatus = async () => {
    const isActive = await LocationService.isLocationUpdateActive();
    setIsServiceActive(isActive);
  };

  const loadStoredConfig = async () => {
    const config = await LocationService.getStoredConfig();
    if (config) {
      setSelectedInterval(config.interval);
      // Try to find the contact by phone number
      if (config.contactNumber && contacts.length > 0) {
        const contact = contacts.find(c => 
          c.phoneNumbers?.some(phone => phone.number.includes(config.contactNumber))
        );
        if (contact) {
          setSelectedContact(contact);
        }
      }
    }
  };

  const handleStartService = async () => {
    if (!selectedContact || !selectedContact.phoneNumbers || selectedContact.phoneNumbers.length === 0) {
      Alert.alert('Error', 'Please select a contact with a phone number');
      return;
    }

    const interval = customInterval ? parseInt(customInterval) : selectedInterval;
    if (interval < 1) {
      Alert.alert('Error', 'Please enter a valid interval (minimum 1 minute)');
      return;
    }

    // Send a test SMS first
    const phoneNumber = selectedContact.phoneNumbers[0].number;
    
    Alert.alert(
      'Test SMS',
      'Send a test location SMS to verify setup?',
      [
        {
          text: 'Skip Test',
          onPress: async () => {
            const success = await LocationService.startLocationUpdates(phoneNumber, interval);
            if (success) {
              setIsServiceActive(true);
              Alert.alert('Success', `Location tracking started. Updates will be sent to ${selectedContact.name} every ${interval} minutes.`);
            } else {
              Alert.alert('Error', 'Failed to start location tracking. Please check permissions.');
            }
          }
        },
        {
          text: 'Send Test',
          onPress: async () => {
            await sendTestSMS(phoneNumber, interval);
          }
        }
      ]
    );
  };

  const sendTestSMS = async (phoneNumber: string, interval: number) => {
    try {
      // Get current location for test
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const testMessage = `LocationTracker Test: Current Location: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}
Accuracy: ${location.coords.accuracy}m
Time: ${new Date().toLocaleString()}
This is a test message. Automatic updates will be sent every ${interval} minutes.`;

      const success = await LocationService.sendTestSMS(phoneNumber, testMessage);
      
      if (success) {
        Alert.alert(
          'Test SMS Sent',
          'Test SMS sent successfully! Start location tracking now?',
          [
            { text: 'Cancel' },
            {
              text: 'Start Tracking',
              onPress: async () => {
                const trackingSuccess = await LocationService.startLocationUpdates(phoneNumber, interval);
                if (trackingSuccess) {
                  setIsServiceActive(true);
                  Alert.alert('Success', `Location tracking started. Updates will be sent to ${selectedContact?.name} every ${interval} minutes.`);
                } else {
                  Alert.alert('Error', 'Failed to start location tracking. Please check permissions.');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Test Failed',
          'Failed to send test SMS. This may be due to missing SMS permissions or platform limitations. Continue with location tracking?',
          [
            { text: 'Cancel' },
            {
              text: 'Continue Anyway',
              onPress: async () => {
                const success = await LocationService.startLocationUpdates(phoneNumber, interval);
                if (success) {
                  setIsServiceActive(true);
                  Alert.alert('Success', `Location tracking started. Note: SMS sending may not work without proper permissions.`);
                } else {
                  Alert.alert('Error', 'Failed to start location tracking. Please check permissions.');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error in test SMS:', error);
      Alert.alert('Error', 'Failed to send test SMS. Please check permissions and try again.');
    }
  };

  const handleStopService = async () => {
    const success = await LocationService.stopLocationUpdates();
    
    if (success) {
      setIsServiceActive(false);
      Alert.alert('Success', 'Location tracking stopped.');
    } else {
      Alert.alert('Error', 'Failed to stop location tracking.');
    }
  };

  const handleUpdatePin = async () => {
    if (!currentPin) {
      Alert.alert('Error', 'Please enter current PIN');
      return;
    }

    if (newPin.length !== 4 || confirmPin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    try {
      // Verify current PIN
      const storedPin = await AsyncStorage.getItem(PIN_STORAGE_KEY) || '1234';
      if (currentPin !== storedPin) {
        Alert.alert('Error', 'Current PIN is incorrect');
        return;
      }

      // Update PIN
      await AsyncStorage.setItem(PIN_STORAGE_KEY, newPin);
      Alert.alert('Success', 'PIN updated successfully');
      setPinModalVisible(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update PIN');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContact = ({ item }: { item: Contact }) => (
    <List.Item
      title={item.name}
      description={item.phoneNumbers?.[0]?.number || 'No phone number'}
      left={props => <List.Icon {...props} icon="account" />}
      onPress={() => {
        setSelectedContact(item);
        setContactModalVisible(false);
      }}
      style={styles.contactItem}
    />
  );

  const renderIntervalButton = (minutes: number) => (
    <Chip
      key={minutes}
      selected={selectedInterval === minutes && !customInterval}
      onPress={() => {
        setSelectedInterval(minutes);
        setCustomInterval('');
      }}
      style={styles.intervalButton}
    >
      {minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`}
    </Chip>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        
        {/* Status Card */}
        <Card style={styles.statusCard}>
          <Card.Content>
            <Title>Location Tracking Status</Title>
            <Paragraph>
              {isServiceActive ? '🟢 Active - Sending automatic SMS updates' : '🔴 Inactive'}
            </Paragraph>
            {selectedContact && (
              <Paragraph>
                Sending to: {selectedContact.name} ({selectedContact.phoneNumbers?.[0]?.number})
              </Paragraph>
            )}
            {isServiceActive && (
              <Paragraph style={{ fontSize: 12, marginTop: 8, color: '#666' }}>
                SMS messages are sent automatically in the background without opening the SMS app.
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Information Card */}
        <Card style={{ marginBottom: 16, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' }}>
          <Card.Content>
            <Title style={{ color: '#3b82f6' }}>📱 Automatic SMS Feature</Title>
            <Paragraph style={{ fontSize: 13, lineHeight: 18 }}>
              • SMS messages are sent automatically without user interaction{'\n'}
              • Messages include Google Maps links for easy location viewing{'\n'}
              • Works completely in the background when app is closed{'\n'}
              • Test SMS available before starting tracking{'\n'}
              • Requires SMS permissions on Android devices
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Contact Selection */}
        <Card style={styles.contactSection}>
          <Card.Content>
            <Title>Select Emergency Contact</Title>
            {selectedContact ? (
              <Card style={styles.selectedContactCard}>
                <Card.Content>
                  <Paragraph>Selected: {selectedContact.name}</Paragraph>
                  <Paragraph>{selectedContact.phoneNumbers?.[0]?.number}</Paragraph>
                </Card.Content>
              </Card>
            ) : (
              <Paragraph>No contact selected</Paragraph>
            )}
            <Button
              mode="outlined"
              onPress={() => setContactModalVisible(true)}
              style={styles.selectContactButton}
              icon="contacts"
            >
              {selectedContact ? 'Change Contact' : 'Select Contact'}
            </Button>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        {/* Time Interval Selection */}
        <Card style={styles.intervalSection}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Update Interval</Title>
            <Paragraph>Choose how often to send location updates:</Paragraph>
            
            <View style={styles.intervalButtons}>
              {PREDEFINED_INTERVALS.map(renderIntervalButton)}
            </View>

            <TextInput
              style={styles.customIntervalInput}
              mode="outlined"
              label="Custom interval (minutes)"
              value={customInterval}
              onChangeText={setCustomInterval}
              keyboardType="numeric"
              placeholder="Enter custom minutes"
            />
          </Card.Content>
        </Card>

        {/* Control Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleStartService}
            disabled={isServiceActive}
            style={[styles.button, styles.startButton]}
            icon="play"
          >
            Start Tracking
          </Button>

          <Button
            mode="contained"
            onPress={handleStopService}
            disabled={!isServiceActive}
            style={[styles.button, styles.stopButton]}
            icon="stop"
          >
            Stop Tracking
          </Button>
        </View>

        {/* PIN Update Section */}
        <Card style={{ marginTop: 20 }}>
          <Card.Content>
            <Title>Security Settings</Title>
            <Button
              mode="outlined"
              onPress={() => setPinModalVisible(true)}
              style={{ marginTop: 10 }}
              icon="lock"
            >
              Update Parental PIN
            </Button>
          </Card.Content>
        </Card>

        {/* Contact Selection Modal */}
        <Portal>
          <Modal
            visible={contactModalVisible}
            onDismiss={() => setContactModalVisible(false)}
            contentContainerStyle={styles.modalContent}
          >
            <Card style={styles.modalCard}>
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title>Select Contact</Title>
                  <IconButton icon="close" onPress={() => setContactModalVisible(false)} />
                </View>
                
                <TextInput
                  style={styles.searchBar}
                  mode="outlined"
                  label="Search contacts"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  left={<TextInput.Icon icon="magnify" />}
                />

                <FlatList
                  data={filteredContacts}
                  renderItem={renderContact}
                  keyExtractor={item => item.id}
                  style={styles.contactsList}
                  showsVerticalScrollIndicator={false}
                />
              </Card.Content>
            </Card>
          </Modal>
        </Portal>

        {/* PIN Update Modal */}
        <Portal>
          <Modal
            visible={pinModalVisible}
            onDismiss={() => setPinModalVisible(false)}
            contentContainerStyle={styles.modalContent}
          >
            <Card style={styles.modalCard}>
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title>Update PIN</Title>
                  <IconButton icon="close" onPress={() => setPinModalVisible(false)} />
                </View>

                <TextInput
                  style={styles.input}
                  mode="outlined"
                  label="Current PIN"
                  value={currentPin}
                  onChangeText={setCurrentPin}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />

                <TextInput
                  style={styles.input}
                  mode="outlined"
                  label="New PIN"
                  value={newPin}
                  onChangeText={setNewPin}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />

                <TextInput
                  style={styles.input}
                  mode="outlined"
                  label="Confirm New PIN"
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />

                <Button
                  mode="contained"
                  onPress={handleUpdatePin}
                  style={styles.button}
                  disabled={!currentPin || !newPin || !confirmPin}
                >
                  Update PIN
                </Button>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>

      </ScrollView>
    </ThemedView>
  );
}
