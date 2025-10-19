import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, FlatList, Platform, PermissionsAndroid, TouchableOpacity } from 'react-native';
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
  const [activeTab, setActiveTab] = useState<'home' | 'cloud'>('home');
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
    requestSMSPermissions();
  }, []);

  // Load stored config after contacts are loaded
  useEffect(() => {
    if (contacts.length > 0) {
      loadStoredConfig();
    }
  }, [contacts]);

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
      console.log('Requesting contacts permission...');
      const { status } = await Contacts.requestPermissionsAsync();
      console.log('Contacts permission status:', status);
      
      if (status === 'granted') {
        console.log('Loading contacts...');
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });

        console.log('Raw contacts loaded:', data.length);

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

        console.log('Formatted contacts with phone numbers:', formattedContacts.length);
        setContacts(formattedContacts);
      } else {
        console.log('Contacts permission denied');
        Alert.alert('Permission Required', 'Please grant contacts permission to select emergency contacts');
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

  console.log('Total contacts:', contacts.length);
  console.log('Filtered contacts:', filteredContacts.length);
  console.log('Search query:', searchQuery);

  const renderContact = ({ item }: { item: Contact }) => (
    <List.Item
      title={item.name}
      description={`${item.phoneNumbers?.[0]?.number || 'No phone number'}${item.phoneNumbers?.[0]?.label ? ` (${item.phoneNumbers[0].label})` : ''}`}
      left={props => <List.Icon {...props} icon="account-circle" />}
      right={props => <List.Icon {...props} icon="chevron-right" />}
      onPress={() => {
        setSelectedContact(item);
        setContactModalVisible(false);
        setSearchQuery(''); // Clear search when contact is selected
      }}
      style={styles.contactItem}
      titleStyle={{ fontSize: 16, fontWeight: '600' }}
      descriptionStyle={{ fontSize: 14, color: '#666' }}
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

  const renderHomeContent = () => (
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
      <Card style={{ 
        marginBottom: 24, 
        backgroundColor: '#f0f9ff', 
        borderWidth: 1.5, 
        borderColor: '#0ea5e9', 
        borderRadius: 18,
        elevation: 3,
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8
      }}>
        <Card.Content>
          <Title style={{ color: '#0ea5e9', fontWeight: '700', fontSize: 18 }}>📱 Automatic SMS Feature</Title>
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
      <Card style={{ marginTop: 20, marginBottom: 100 }}>
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
    </ScrollView>
  );

  const renderCloudContent = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <Card style={{ 
        width: '100%', 
        backgroundColor: '#f0f9ff', 
        borderWidth: 1.5, 
        borderColor: '#0ea5e9',
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12
      }}>
        <Card.Content style={{ alignItems: 'center', padding: 40 }}>
          <View style={{ backgroundColor: '#bae6fd', borderRadius: 50, padding: 24, marginBottom: 24 }}>
            <IconButton icon="cloud" size={48} iconColor="#0ea5e9" />
          </View>
          <Title style={{ color: '#0ea5e9', textAlign: 'center', marginBottom: 16, fontWeight: '700', fontSize: 24 }}>
            Cloud Sync
          </Title>
          <Paragraph style={{ textAlign: 'center', fontSize: 16, lineHeight: 24, color: '#475569', fontWeight: '500' }}>
            Cloud synchronization and backup features will be available soon!
          </Paragraph>
          <Paragraph style={{ textAlign: 'center', fontSize: 14, marginTop: 20, color: '#94a3b8', fontWeight: '400' }}>
            Stay tuned for updates 🚀
          </Paragraph>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'home' ? renderHomeContent() : renderCloudContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'home' && styles.activeTab]}
          onPress={() => setActiveTab('home')}
        >
          <IconButton 
            icon="home" 
            size={24} 
            iconColor={activeTab === 'home' ? '#4f46e5' : '#6b7280'} 
          />
          <ThemedText style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>
            Home
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'cloud' && styles.activeTab]}
          onPress={() => setActiveTab('cloud')}
        >
          <IconButton 
            icon="cloud" 
            size={24} 
            iconColor={activeTab === 'cloud' ? '#4f46e5' : '#6b7280'} 
          />
          <ThemedText style={[styles.tabText, activeTab === 'cloud' && styles.activeTabText]}>
            Cloud
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Contact Selection Modal */}
      <Portal>
        <Modal
          visible={contactModalVisible}
          onDismiss={() => setContactModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Card style={styles.modalCard}>
            <Card.Content style={{ flex: 1, padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title style={{ fontSize: 20, fontWeight: 'bold' }}>Select Contact</Title>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Paragraph style={{ fontSize: 12, color: '#666', marginRight: 8 }}>
                    {filteredContacts.length} of {contacts.length}
                  </Paragraph>
                  <IconButton icon="close" onPress={() => setContactModalVisible(false)} />
                </View>
              </View>
              
              <TextInput
                style={styles.searchBar}
                mode="outlined"
                label="Search contacts"
                value={searchQuery}
                onChangeText={setSearchQuery}
                left={<TextInput.Icon icon="magnify" />}
                right={searchQuery ? <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} /> : undefined}
              />

              <View style={{ flex: 1 }}>
                {filteredContacts.length > 0 ? (
                  <FlatList
                    data={filteredContacts}
                    renderItem={renderContact}
                    keyExtractor={item => item.id}
                    style={styles.contactsList}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingBottom: 10 }}
                  />
                ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <IconButton 
                    icon={contacts.length === 0 ? "account-off" : "account-search"} 
                    size={48} 
                    iconColor="#9ca3af" 
                    style={{ marginBottom: 10 }}
                  />
                  <Title style={{ textAlign: 'center', color: '#666', fontSize: 18, marginBottom: 8 }}>
                    {contacts.length === 0 ? 'No Contacts Found' : 'No Matching Contacts'}
                  </Title>
                  <Paragraph style={{ textAlign: 'center', color: '#666', fontSize: 14, lineHeight: 20 }}>
                    {contacts.length === 0 
                      ? 'Please grant contacts permission and ensure you have contacts with phone numbers saved on your device.' 
                      : `No contacts match "${searchQuery}". Try adjusting your search.`}
                  </Paragraph>
                  {contacts.length === 0 && (
                    <Button
                      mode="contained"
                      onPress={loadContacts}
                      style={{ marginTop: 16, backgroundColor: '#4f46e5' }}
                      icon="refresh"
                    >
                      Reload Contacts
                    </Button>
                  )}
                  {contacts.length > 0 && searchQuery && (
                    <Button
                      mode="outlined"
                      onPress={() => setSearchQuery('')}
                      style={{ marginTop: 16 }}
                      icon="close"
                    >
                      Clear Search
                    </Button>
                  )}
                </View>
              )}
              </View>
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
    </ThemedView>
  );
}
