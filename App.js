/**
 * Main Application Entry Point
 * This file sets up the core navigation structure and authentication context for the app
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from './src/lib/supabase';

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

const App = () => {
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