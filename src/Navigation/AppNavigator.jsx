import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../Screens/Home';
import AccountTransactionsScreen from '../Screens/AccountTransactionsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  console.log('AppNavigator rendering');
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={Home}
          options={{
            animation: 'none'
          }}
        />
        <Stack.Screen 
          name="AccountTransactions" 
          component={AccountTransactionsScreen}
          options={{
            animation: 'slide_from_right'
          }}
        />
        {/* ... existing screens ... */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 