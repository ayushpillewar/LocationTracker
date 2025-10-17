# Quick Start Guide - LocationTracker

## 🚀 Running the Application

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed (`npm install -g @expo/cli`)
- Android Studio (for Android) or Xcode (for iOS)
- Physical device or emulator

### 1. Install Dependencies
```bash
cd LocationTracker
npm install
```

### 2. Start Development Server
```bash
npx expo start
```

### 3. Run on Device
- **Android**: Press 'a' or scan QR code with Expo Go
- **iOS**: Press 'i' or scan QR code with Expo Go
- **Web**: Press 'w' (limited functionality)

## 🧪 Testing the Application

### Step 1: PIN Authentication
- Default PIN: `1234`
- Enter PIN to access main interface

### Step 2: Grant Permissions
When prompted, allow:
- ✅ Location access (Always)
- ✅ Contacts access
- ✅ SMS permissions

### Step 3: Setup Emergency Contact
1. Tap "Select Contact"
2. Search or browse your contacts
3. Select a contact with a phone number
4. Verify selection appears in UI

### Step 4: Configure Interval
1. Choose from predefined intervals (5, 10, 15, 30, 60, 120 min)
2. OR enter custom interval in minutes
3. Interval determines SMS frequency

### Step 5: Start Location Tracking
1. Ensure contact is selected
2. Ensure interval is configured
3. Tap "Start Tracking"
4. Check status shows "🟢 Active"

### Step 6: Verify Background Operation
1. Minimize or close the app
2. Wait for configured interval
3. Check if SMS was sent to emergency contact
4. SMS contains Google Maps link with location

### Step 7: Update PIN (Optional)
1. Tap "Update Parental PIN"
2. Enter current PIN (1234)
3. Enter new 4-digit PIN
4. Confirm new PIN
5. Test new PIN by restarting app

## 📱 Expected SMS Format
```
LocationTracker Test: Current Location: https://maps.google.com/?q=40.7128,-74.0060
Accuracy: 5m
Time: 10/18/2025, 2:30:00 PM
This is a test message. Automatic updates will be sent every 15 minutes.
```

## 🔧 Automatic SMS Implementation

### How It Works
- **Direct SMS Sending**: Uses `react-native-sms-android` library for automatic SMS
- **No User Interaction**: SMS sent directly without opening SMS app
- **Background Operation**: Continues working when app is closed
- **Platform Support**: Currently optimized for Android devices

### SMS Permissions (Android)
1. **Runtime Permission**: App requests SMS permission automatically
2. **System Settings**: Manually enable in Settings > Apps > LocationTracker > Permissions
3. **Default SMS App**: Not required to be set as default SMS app
4. **Testing**: Use "Send Test" option to verify SMS functionality

## 🛠️ Troubleshooting

### Location Not Working
- Enable GPS/Location Services
- Check app has location permissions
- Ensure "Always" location access is granted

### SMS Not Sending
- **Check Permissions**: Ensure SMS permission is granted in app settings
- **Platform Limitation**: iOS requires different approach (not implemented in current version)
- **Network/Carrier**: Verify device has active SMS plan and signal
- **Phone Number Format**: Ensure contact phone number is valid
- **Test Feature**: Use "Send Test" button to troubleshoot SMS functionality
- **Alternative**: Contact admin if SMS consistently fails

### SMS Opens Instead of Auto-Sending
- **Library Issue**: Ensure `react-native-sms-android` is properly installed
- **Permission Missing**: Check if SMS permission was denied
- **Platform Check**: Feature works primarily on Android devices
- **Fallback Behavior**: App may fall back to opening SMS app on some devices

### Background Tracking Stops
- Disable battery optimization for app
- Enable background app refresh
- Check auto-start permissions

### Contacts Not Loading
- Grant contacts permission
- Ensure device has contacts
- Restart app after granting permissions

## 🔧 Development Commands

```bash
# Start development server
npx expo start

# Run on Android emulator
npx expo run:android

# Run on iOS simulator  
npx expo run:ios

# Clear cache
npx expo start --clear

# Install dependencies
npm install

# Type checking
npx tsc --noEmit

# Lint code
npx expo lint
```

## 📊 Testing Scenarios

### Scenario 1: Basic Functionality
1. ✅ PIN authentication works
2. ✅ Contact selection works
3. ✅ Interval configuration works
4. ✅ Start/stop tracking works
5. ✅ SMS sends successfully

### Scenario 2: Background Operation
1. ✅ App continues working when minimized
2. ✅ Location updates continue in background
3. ✅ SMS sends at configured intervals
4. ✅ Foreground service notification appears

### Scenario 3: Permission Handling
1. ✅ Graceful handling of denied permissions
2. ✅ Clear error messages for missing permissions
3. ✅ Re-request permissions when needed

### Scenario 4: Edge Cases
1. ✅ No internet connection handling
2. ✅ Invalid phone number handling
3. ✅ GPS disabled handling
4. ✅ Low battery scenarios

## 🚨 Important Notes

### For Production Use
- Test on physical devices (emulators may not support all features)
- Verify SMS costs with carrier
- Test battery impact over extended periods
- Ensure compliance with privacy laws

### Performance Considerations
- Location accuracy affects battery usage
- Shorter intervals = more battery consumption
- Background restrictions vary by device manufacturer
- Some Android devices require manual background app permissions

### Privacy & Security
- Location data only sent to selected contact
- No data stored on external servers
- PIN provides basic access control
- Consider encryption for production use

## 📞 Support

If you encounter issues:
1. Check console logs in development
2. Verify all permissions are granted
3. Test on physical device (not emulator)
4. Check device-specific background app settings
5. Refer to Expo documentation for platform-specific issues

