import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler } from 'react-native';
import useBackHandler from './src/hooks/useBackHandler';

// Screen Imports
import Splash from './src/Screens/Splash';
import Login from './src/Screens/Login';
import Signup from './src/Screens/Signup';
import ForgotPasswordScreen from './src/Screens/ForgotPasswordScreen';
// Import the main App Navigator
import AppNavigator from './src/Navigation/appNavigation'; // Corrected path

// Import screens for the bank linking flow
import SelectBankScreen from './src/Screens/SelectbankScreen';
import FakeLoginScreen from './src/Screens/FakeLoginScreen';
import SelectFakeAccountsScreen from './src/Screens/FakeAccountScreen';
// Note: Removed import for AddAccountScreen as it's not used directly as a component here.

const Stack = createNativeStackNavigator();

// Initialize Supabase client
const supabaseUrl = 'https://whsuumrsdvncjudaxjva.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3V1bXJzZHZuY2p1ZGF4anZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMTMwNjYsImV4cCI6MjA0NDU4OTA2Nn0.Q7fIO9_B6VezWXmFHxR24w_NaZ9z4MZCdnYU8FgC9HI';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

const App = () => {
  // Handle app exit
  const handleExit = () => {
    BackHandler.exitApp();
  };

  // Use our custom back handler hook
  useBackHandler(handleExit);

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false, // Hide headers globally by default for this top stack
          }}
        >
          {/* Initial Screens */}
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

          {/* Main App Navigator (contains Tabs) */}
          <Stack.Screen name="AppMain" component={AppNavigator} />

          {/* The Bank Account Linking Flow */}
          {/* This screen is navigated to from Home.jsx using navigation.navigate('SelectBankScreen') */}
          <Stack.Screen
              name="SelectBankScreen"
              component={SelectBankScreen}
              options={{
                  headerShown: false, // SelectBankScreen renders its own custom header
              }}
          />
          <Stack.Screen
              name="FakeLoginScreen"
              component={FakeLoginScreen}
              options={{
                  headerShown: true,
                  title: 'Bank Login', // Title for the header bar
              }}
          />
          <Stack.Screen
              name="SelectFakeAccountsScreen"
              component={SelectFakeAccountsScreen}
              options={{
                  headerShown: true,
                  title: 'Select Accounts', // Title for the header bar
              }}
          />

          {/* Example: If you needed BudgetPlanner accessible outside tabs too */}
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