// navigation/AppNavigation.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Screen Imports ---
// Tab Screens
import Home from '../Screens/Home';
import Calculators from '../Components/Calculators'; // Keep if needed, otherwise CalculatorList acts as entry
import transactionsScreen from '../Components/transactionScreen';
import BudgetPlanner from '../Screens/BudgetPlanner';
import Settings from '../Screens/Settings';

// Calculator Screens
/*import { Calculators } from '../Components/Calculators'; // Component to list calculators*/
import MortgageCalculator from '../Screens/MortgageCalculator';
import BuyVsRentCalculator from '../Screens/BuyingVsRentingCalculator';
import CarLoanCalculator from '../Screens/CarLoanCalculator';
import GroceryCalculator from '../Screens/GroceryCalculator'; // Added from App.js
import DebtCalculator from '../Screens/DebtCalculator'; // Added from App.js
// Add other calculators if they exist:
// import StudentLoanCalculator from '../Screens/StudentLoanCalculator';
// import TravelCalculator from '../Screens/TravelCalculator';

// Menu/Settings Stack Screens
import CreditReportRequestForm from '../Screens/CreditReport'; // Added from App.js

// --- Navigator Definitions ---
const Tab = createBottomTabNavigator();
const CalculatorStack = createStackNavigator();
const MenuStack = createStackNavigator();

// --- Stack Navigators ---

// Calculator Stack Navigator (Nested within Calculators Tab)
const CalculatorStackNavigator = () => (
  <CalculatorStack.Navigator
    screenOptions={{
      // Optional: Add default screen options for this stack
      // headerStyle: { backgroundColor: '#f4511e' },
      // headerTintColor: '#fff',
    }}
  >
    <CalculatorStack.Screen
      name="Calculators"
      component={Calculators} // Use CalculatorsScreen as the list entry point
      options={{ title: 'Financial Calculators' }}
    />
    {/* Link specific calculators from the list screen */}
    <CalculatorStack.Screen name="Mortgage" component={MortgageCalculator} options={{ title: 'Mortgage Calculator' }} />
    <CalculatorStack.Screen name="BuyVsRent" component={BuyVsRentCalculator} options={{ title: 'Buy vs. Rent' }}/>
    <CalculatorStack.Screen name="Car Loan" component={CarLoanCalculator} options={{ title: 'Car Loan Calculator' }}/>
    <CalculatorStack.Screen name="Grocery" component={GroceryCalculator} options={{ title: 'Grocery Calculator' }}/>
    <CalculatorStack.Screen name="Debt" component={DebtCalculator} options={{ title: 'Debt Calculator' }}/>
    {/* Add other calculator screens here if needed */}
    {/* <CalculatorStack.Screen name="StudentLoan" component={StudentLoanCalculator} /> */}
    {/* <CalculatorStack.Screen name="Travel" component={TravelCalculator} /> */}
  </CalculatorStack.Navigator>
);

// Menu Stack Navigator (Nested within Menu Tab)
const MenuStackNavigator = () => (
  <MenuStack.Navigator>
    <MenuStack.Screen
      name="SettingsList" // Renamed from "Settings" to avoid conflict with Tab name if needed
      component={Settings}
      options={{ title: 'More Options' }} // Or keep 'Account & Settings'
    />
    <MenuStack.Screen
      name="CreditReport"
      component={CreditReportRequestForm}
      options={{ title: 'Credit Report Request' }}
    />
    {/* Add other screens accessible from the Menu/Settings section here */}
  </MenuStack.Navigator>
);


// --- Main Bottom Tab Navigator ---
const AppNavigator = () => (
  <Tab.Navigator
    initialRouteName="Home" // Optional: set the default tab
    screenOptions={{
      tabBarActiveTintColor: '#3B82F6', // Blue-500
      tabBarInactiveTintColor: '#64748B', // Slate-500
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5, // Add padding top for balance
        height: 60,
        backgroundColor: '#FFFFFF', // Ensure background is set
        borderTopColor: '#E5E7EB', // Add a subtle top border
        borderTopWidth: 1,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        // fontWeight: '500', // Medium weight for labels
      },
      headerShown: false, // Hide headers for Tab screens by default (Stacks handle their own)
    }}
  >
    <Tab.Screen
      name="Home" // Use a distinct name like 'HomeTab' if 'Home' is used elsewhere
      component={Home}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home-variant" color={color} size={size} /> // Use filled variant
        ),
        // No headerShown: false needed here, inherits from screenOptions
      }}
    />

    <Tab.Screen
      name="CalculatorsTab" // Distinct name
      component={CalculatorStackNavigator} // Use the Stack Navigator
      options={{
        tabBarLabel: 'Calculators',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="calculator-variant" color={color} size={size} />
        ),
        // Header is handled by the CalculatorStackNavigator itself
      }}
    />

    <Tab.Screen
      name="TransactionsTab" // Distinct name
      component={transactionsScreen}
      options={{
        tabBarLabel: 'Transactions',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="swap-horizontal" color={color} size={size} />
        ),
         headerShown: true, // Show header specifically for Transactions if needed
         title: 'All Transactions' // Set header title for this tab
      }}
    />

     <Tab.Screen
        name="BudgetTab" // Distinct name
        component={BudgetPlanner}
        options={{
          tabBarLabel: 'Budget',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-pie" color={color} size={size} /> // Pie chart icon
          ),
           headerShown: true, // Show header specifically for Budget Planner if needed
           title: 'Budget Planner' // Set header title for this tab
        }}
      />

    <Tab.Screen
      name="MenuTab" // Distinct name
      component={MenuStackNavigator} // Use the Stack Navigator
      options={{
        tabBarLabel: 'More',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="menu" color={color} size={size} />
        ),
         // Header is handled by the MenuStackNavigator itself
      }}
    />
  </Tab.Navigator>
);

export default AppNavigator;