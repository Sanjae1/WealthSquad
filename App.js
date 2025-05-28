/**
 * Main Application Entry Point
 * This file sets up the core navigation structure and authentication context for the app
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Supabase Configuration
// Initialize the Supabase client with project URL and anonymous key
const supabaseUrl = 'https://whsuumrsdvncjudaxjva.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3V1bXJzZHZuY2p1ZGF4anZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMTMwNjYsImV4cCI6MjA0NDU4OTA2Nn0.Q7fIO9_B6VezWXmFHxR24w_NaZ9z4MZCdnYU8FgC9HI';

// Configure Supabase client with authentication settings
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,        // Use AsyncStorage for session persistence
    autoRefreshToken: true,       // Automatically refresh the session token
    persistSession: true,         // Keep the session active between app launches
    detectSessionInUrl: false     // Disable URL session detection for mobile
  }
});

const App = () => {
  // Function to handle app exit when back button is pressed
  const handleExit = () => {
    BackHandler.exitApp();
  };

  // Custom hook to handle back button press behavior
  useBackHandler(handleExit);

  return (
    // Wrap the entire app with Supabase session context
    <SessionContextProvider supabaseClient={supabase}>
      <NavigationContainer>
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

          {/* Example of how to add standalone screens outside the tab navigation */}
          {/* <Stack.Screen
              name="StandaloneBudget"
              component={BudgetPlanner}
              options={{
                  headerShown: true,
                  title: 'Budget Planner',
              }}
          /> */}

        </Stack.Navigator>
      </NavigationContainer>
    </SessionContextProvider>
  );
};

export default App;