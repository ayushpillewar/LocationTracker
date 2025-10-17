# LocationTracker - Parental Control App

A React Native Expo application that allows parents to track their child's location by automatically sending SMS updates to emergency contacts.

## Features

### 🔐 **Secure PIN Authentication**
- Parental control with 4-digit PIN
- Ability to update PIN from within the app
- Secure AsyncStorage for PIN persistence

### 📱 **Contact Management**
- Access device contacts
- Select emergency contact for location updates
- Search and filter contacts
- Display contact names and phone numbers

### ⏰ **Flexible Time Intervals**
- Predefined intervals: 5, 10, 15, 30, 60, 120 minutes
- Custom interval input (any number of minutes)
- Real-time interval configuration

### 📍 **Background Location Tracking**
- Automatic location updates using GPS
- Background service that works when app is closed
- High-accuracy location data
- Foreground service notification

### 📤 **Automatic SMS Sending**
- Sends location as Google Maps link automatically
- **No user interaction required** - SMS sent directly in background
- Includes accuracy and timestamp information
- Works with `react-native-sms-android` for direct sending
- Test SMS feature available before starting tracking
- Platform optimized for Android devices

### 🎨 **Modern UI Design**
- Glass-morphism design elements
- Responsive layout for all screen sizes
- Material Design components
- Intuitive user experience

## Technical Implementation

### **Core Technologies**
- **React Native** with **Expo SDK 51**
- **TypeScript** for type safety
- **React Native Paper** for UI components
- **Expo Router** for navigation

### **Key Dependencies**
```json
{
  "expo-location": "Location services and background tracking",
  "expo-task-manager": "Background task management",
  "expo-sms": "SMS sending functionality",
  "expo-contacts": "Device contacts access",
  "@react-native-async-storage/async-storage": "Local data persistence",
  "react-native-paper": "Material Design UI components"
}
```

### **Permissions Required**
- **Location (Always)**: For background location tracking
- **Contacts**: To select emergency contacts
- **SMS**: To send location updates
- **Background Processing**: For continuous operation

## Setup Instructions

### **1. Install Dependencies**
```bash
cd LocationTracker
npm install
```

### **2. Configure Permissions**
Permissions are already configured in `app.json`:
- iOS: NSLocation permissions and NSContacts permission
- Android: Location, Contacts, SMS, and Background service permissions

### **3. Run the Application**
```bash
# Start development server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS  
npx expo run:ios
```

### **4. Build for Production**
```bash
# Build Android APK
npx expo build:android

# Build iOS IPA
npx expo build:ios
```

## Usage Guide

### **Initial Setup**
1. **Launch App**: Enter the default PIN `1234`
2. **Grant Permissions**: Allow location, contacts, and SMS access
3. **Select Contact**: Choose an emergency contact from your contacts
4. **Set Interval**: Choose how often to send location updates
5. **Start Tracking**: Tap "Start Tracking" to begin

### **Location Updates**
- Updates are sent as SMS with Google Maps links
- Format: `Current Location: https://maps.google.com/?q=lat,lng`
- Includes accuracy and timestamp information
- Works completely in the background

### **Managing Settings**
- **Change Contact**: Select different emergency contact anytime
- **Update Interval**: Modify how often updates are sent
- **Change PIN**: Update parental control PIN for security
- **Stop/Start**: Control tracking as needed

## File Structure

```
LocationTracker/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # PIN authentication screen
│   │   ├── explore.tsx        # Main control interface
│   │   └── styles.tsx         # Shared styling
│   └── services/
│       └── backgroundService.tsx  # Location tracking service
├── components/               # Reusable UI components
├── constants/               # App constants and themes
├── assets/                  # Images and static assets
└── app.json                # Expo configuration
```

## Security Features

### **PIN Protection**
- 4-digit PIN prevents unauthorized access
- PIN is stored securely using AsyncStorage
- Can be updated from within the app
- Default PIN: `1234`

### **Permission Management**
- Requests only necessary permissions
- Transparent about data usage
- User controls when tracking starts/stops

### **Data Privacy**
- Location data sent only to selected contact
- No data stored on external servers
- Local storage for configuration only

## Technical Details

### **Background Service Implementation**
```typescript
// Location tracking with TaskManager
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  // Handle location updates
  // Send SMS automatically
  // Continue working in background
});
```

### **SMS Integration**
```typescript
// Automatic SMS sending
const message = `Current Location: https://maps.google.com/?q=${lat},${lng}
Accuracy: ${accuracy}m
Time: ${timestamp}`;

await SMS.sendSMSAsync([phoneNumber], message);
```

### **State Management**
- React hooks for UI state
- AsyncStorage for persistent data
- Background service for location state

## Troubleshooting

### **Common Issues**
1. **Location Not Working**: Ensure GPS is enabled and permissions granted
2. **SMS Not Sending**: Check SMS permissions and phone number format
3. **Background Tracking Stops**: Disable battery optimization for the app
4. **Contacts Not Loading**: Verify contacts permission is granted

### **Android Specific**
- **Battery Optimization**: Disable for continuous background operation
- **Auto-start**: Enable auto-start permission for background service
- **Background App Limits**: Exempt app from background restrictions

### **iOS Specific**
- **Background App Refresh**: Enable for the app
- **Location Services**: Ensure "Always" is selected
- **Low Power Mode**: May limit background operations

## Production Considerations

### **Performance**
- Optimized for battery usage
- Configurable update intervals
- Efficient background processing

### **Reliability**
- Error handling for network issues
- Retry mechanisms for failed SMS
- Persistent configuration storage

### **Scalability**
- Modular service architecture
- Easy to extend with new features
- Clean separation of concerns

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review Expo documentation for platform-specific issues