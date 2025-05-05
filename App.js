import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import Splash from './src/Screens/Splash';
import Login from './src/Screens/Login';
import Signup from './src/Screens/Signup';
import Home from './src/Screens/Home';
import Calculators from './src/Screens/Calculators'; 
import GroceryCalculator from './src/Screens/GroceryCalculator'; 
import DebtCalculator from './src/Screens/DebtCalculator'; 
import CarLoan from './src/Screens/CarLoanCalculator';
import BuyingVsRentingCalculator from './src/Screens/BuyingVsRentingCalculator';
import MortgageCalculator from './src/Screens/MortgageCalculator';
import CreditReportRequestForm from './src/Screens/CreditReport';
import TransactionsScreen from './src/Screens/transactionScreen';
import BudgetPlanner from './src/Screens/BudgetPlanner';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AddAccountScreen from './src/Screens/AddAccountScreen';
import SelectBankScreen from './src/Screens/SelectbankScreen';
import FakeLoginScreen from './src/Screens/FakeLoginScreen';
import SelectFakeAccountsScreen from './src/Screens/FakeAccountScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
          headerShown: false
        }}
      />

      <Tab.Screen 
        name="Calculators" 
        component={Calculators}
        options={{
          tabBarLabel: 'Calculators',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calculator" color={color} size={26} />
          ),
        }}
      />

      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen}
        options={{
          tabBarLabel: 'Transactions',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="swap-horizontal" color={color} size={26} />
          ),
        }}
      />

      <Tab.Screen 
        name="Budget" 
        component={BudgetPlanner}
        options={{
          tabBarLabel: 'Budget',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-bar" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};




const DrawerNavigator = () => {
  return (
    <Drawer.Navigator initialRouteName="DrawerHome">
      <Drawer.Screen name="DrawerHome" component={TabNavigator} />
      <Drawer.Screen name="Grocery Calculator" component={GroceryCalculator} />
      <Drawer.Screen name="Debt Calculator" component={DebtCalculator} />
      <Drawer.Screen name="Car Loan" component={CarLoan} />
      <Drawer.Screen name="BuyingVsRenting Calculator" component={BuyingVsRentingCalculator} />
      <Drawer.Screen name="Mortgage Calculator" component={MortgageCalculator} /> 
      <Drawer.Screen name ="Credit Report Form" component={CreditReportRequestForm} />
    </Drawer.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Home" component={DrawerNavigator} />



 {/* === ADD THE AddAccountScreen HERE === */}
 <Stack.Screen
            name="AddAccountScreen" // The name used in navigation.navigate()
            component={SelectBankScreen}
            options={{
                headerShown: true, // Show header for this screen
                title: 'Add New Account' // Set the header title
                // You can add other header options like back button color, etc.
            }}

        />
        {/* === END OF ADDITION === */}


        <Stack.Screen 
        
        name= "Budget" 
        component={BudgetPlanner} 
         
          options={{
            headerShown: true, // Show header for this screen
            title: 'Budget Planner'
        }}
        
        
        />

       


      <Stack.Screen name="SelectBankScreen" component={SelectBankScreen} />
  <Stack.Screen name="FakeLoginScreen" component={FakeLoginScreen} />
  <Stack.Screen name="SelectFakeAccountsScreen" component={SelectFakeAccountsScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;