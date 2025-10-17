# LocationTrackerLocation Tracker App
A React Native application with parental lock and location tracking capabilities for Android devices.

Features
Parental Lock: 4-digit PIN protection on app launch
Location Tracking: Send GPS location via SMS at specified intervals
Background Service: Continues tracking even when app is closed
Modern UI: Clean, intuitive interface with smooth animations
Project Structure
LocationTrackerApp/
├── src/
│   ├── screens/
│   │   ├── ParentalLockScreen.js    # PIN entry screen
│   │   └── LocationTrackerScreen.js # Main tracking interface
│   └── services/
│       └── LocationService.js       # Location tracking logic
├── android/
│   └── app/src/main/
│       ├── AndroidManifest.xml      # Permissions & service config
│       └── java/com/yourapp/
│           └── LocationTrackingService.java  # Native background service
├── App.js                           # Main app entry point
├── package.json                     # Dependencies
└── README.md                        # This file
Prerequisites
Node.js (>= 18.x)
React Native development environment
Android Studio
Android SDK (API level 26+)
Java Development Kit (JDK 11 or higher)
Installation
1. Clone and Install Dependencies
bash
# Install Node modules
npm install

# Install iOS dependencies (if needed)
cd ios && pod install && cd ..
2. Android Setup
Update the package name in the following files:

android/app/src/main/AndroidManifest.xml
android/app/src/main/java/com/yourapp/LocationTrackingService.java
android/app/build.gradle
Replace com.yourapp with your actual package name.

3. Link Vector Icons
bash
# Link react-native-vector-icons
react-native link react-native-vector-icons
Add to android/app/build.gradle:

gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
4. Configure Permissions
The app requires the following permissions (already configured in AndroidManifest.xml):

ACCESS_FINE_LOCATION - Get precise GPS location
ACCESS_BACKGROUND_LOCATION - Track location in background
SEND_SMS - Send location via SMS
FOREGROUND_SERVICE - Run background service
Running the App
Development Mode
bash
# Start Metro bundler
npm start

# Run on Android
npm run android
Build Release APK
bash
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
Usage
First Launch
App opens with Parental Lock screen
Default PIN is 1234
Use the settings icon (⚙️) to set a custom PIN
Setting Up Tracking
Enter PIN to unlock
Input target phone number (with country code)
Set update interval (1-60 minutes)
Grant location and SMS permissions when prompted
Press "Start Tracking"
SMS Format
Location updates are sent as:

Location Update
Time: [timestamp]
Lat: [latitude]
Lon: [longitude]
Accuracy: [accuracy in meters]
Map: https://maps.google.com/?q=[lat],[lon]
Security Features
PIN stored securely using AsyncStorage
App maintains tracking state across restarts
Permissions validated before starting service
Confirmation required to stop tracking
Important Notes
Permissions
Background Location: Required for Android 10+ to track location when app is closed
SMS: App uses device SMS (carrier charges apply)
Battery Optimization
Add app to battery optimization whitelist for reliable background tracking
High-accuracy GPS may drain battery faster
Testing
Test on physical devices (not emulators) for GPS and SMS
Ensure SIM card is active for SMS functionality
Check location services are enabled on device
Troubleshooting
Location Not Updating
Check GPS is enabled
Verify location permissions granted
Ensure app is not battery optimized
Check device has clear view of sky for GPS
SMS Not Sending
Verify SEND_SMS permission granted
Check SIM card is active
Ensure sufficient SMS balance
Test with a valid phone number
App Crashes on Launch
Clear app data: Settings → Apps → Location Tracker → Clear Data
Reinstall the app
Check logcat for error messages: adb logcat
Dependencies
Core
react-native: ^0.73.0
react: ^18.2.0
@react-navigation/native: ^6.1.9
@react-navigation/stack: ^6.3.20
Utilities
@react-native-async-storage/async-storage: ^1.21.0
react-native-vector-icons: ^10.0.3
Location & Background
@react-native-community/geolocation: ^3.2.1
react-native-background-timer: ^2.4.1
react-native-sms-android: ^1.13.0
Code Standards
Modular Architecture: Separate screens, services, and components
Error Handling: Try-catch blocks and user-friendly error messages
Async Operations: Proper async/await usage
Comments: Clear documentation for complex logic
Naming Conventions: Descriptive variable and function names
State Management: React hooks (useState, useEffect)
Styling: StyleSheet for performance optimization
Future Enhancements
 Support for multiple phone numbers
 Location history log
 Geofencing alerts
 Battery level in SMS
 Emergency SOS button
 iOS support
 Cloud backup of settings
License
MIT License - Feel free to use and modify for your needs

Support
For issues and questions:

Check troubleshooting section
Review Android logcat output
Verify all permissions are granted
Test on different devices
Default PIN: 1234

Remember to change the default PIN on first use for security!

