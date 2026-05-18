/**
 * Main Application Entry Point
 * This file sets up the core navigation structure and authentication context for the app
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { BackHandler } from 'react-native';
import useBackHandler from './src/hooks/useBackHandler';

// Authentication and Onboarding Screens
import Splash from './src/Screens/Splash';
import Login from './src/Screens/Login';
import Signup from './src/Screens/Signup';
import ForgotPasswordScreen from './src/Screens/ForgotPasswordScreen';

// Main Application Navigation
import AppNavigator from './src/Navigation/appNavigation';

// Bank Account Linking Flow Screens
import SelectBankScreen from './src/Screens/SelectbankScreen';
import FakeLoginScreen from './src/Screens/FakeLoginScreen';
import SelectFakeAccountsScreen from './src/Screens/FakeAccountScreen';

// Create the main navigation stack
const Stack = createNativeStackNavigator();

import { supabase } from './src/Services/supabaseClient';
import { notificationManager } from './src/Services/NotificationManager';
import { useNavigationContainerRef } from '@react-navigation/native';

const App = () => {
  const navigationRef = useNavigationContainerRef();

  React.useEffect(() => {
    notificationManager.requestPermissions();
    notificationManager.setupListeners(navigationRef);
    return () => notificationManager.removeListeners();
  }, []);

  // Function to handle app exit when back button is pressed
  const handleExit = () => {
    BackHandler.exitApp();
  };

  // Custom hook to handle back button press behavior
  useBackHandler(handleExit);

  return (
    // Wrap the entire app with Supabase session context
    <SessionContextProvider supabaseClient={supabase}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false, // Hide headers globally by default
          }}
        >
          {/* Authentication Flow Screens */}
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

          {/* Main Application Navigation (Tab-based) */}
          <Stack.Screen name="AppMain" component={AppNavigator} />

          {/* Bank Account Linking Flow Screens */}
          <Stack.Screen
              name="SelectBankScreen"
              component={SelectBankScreen}
              options={{
                  headerShown: false, // Custom header implementation in SelectBankScreen
              }}
          />
          <Stack.Screen
              name="FakeLoginScreen"
              component={FakeLoginScreen}
              options={{
                  headerShown: true,
                  title: 'Bank Login',
              }}
          />
          <Stack.Screen
              name="SelectFakeAccountsScreen"
              component={SelectFakeAccountsScreen}
              options={{
                  headerShown: true,
                  title: 'Select Accounts',
              }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </SessionContextProvider>
  );
};

export default App;
