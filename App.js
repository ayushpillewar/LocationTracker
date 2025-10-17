// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ParentalLockScreen from './src/screens/ParentalLockScreen';
import LocationTrackerScreen from './src/screens/LocationTrackerScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ParentalLock"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="ParentalLock" component={ParentalLockScreen} />
        <Stack.Screen name="LocationTracker" component={LocationTrackerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;