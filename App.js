import { View, Text } from 'react-native';
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from './src/Screens/Splash';
import Login from './src/Screens/Login';
import Signup from './src/Screens/Signup';


const Stack = createNativeStackNavigator();

const App = () => {
 return (
    <NavigationContainer>
    <Stack.Navigator
    initialRouteName='Spash'
    screenOptions={{
      headerShown: false,
    }}
    >
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
 </NavigationContainer>
 )
}

export default App