/**
 * Main Navigation Configuration
 * This file sets up the complete navigation structure for the app, including:
 * - Bottom Tab Navigation
 * - Stack Navigators for each tab
 * - Screen configurations and styling
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Screen Imports ---
// Main Tab Screens
import Home from '../Screens/Home';
import AccountTransactionsScreen from '../Screens/AccountTransactionsScreen';
import Calculators from '../Components/Calculators';
import transactionsScreen from '../Components/transactionScreen';
import BudgetPlanner from '../Screens/BudgetPlanner';
import Settings from '../Screens/Settings.jsx';
import FinanceTips from '../Screens/FinanceTips';
import FinanceTipDetail from '../Screens/FinanceTipDetail';

// Financial Calculator Screens
import MortgageCalculator from '../Screens/MortgageCalculator';
import BuyVsRentCalculator from '../Screens/BuyingVsRentingCalculator';
import CarLoanCalculator from '../Screens/CarLoanCalculator';
import GroceryCalculator from '../Screens/GroceryCalculator';
import DebtCalculator from '../Screens/DebtCalculator';
import TravelCalculator from '../Screens/TravelCalculator';
import StudentLoanCalculator from '../Components/StudentLoanCalculator';

// Additional Settings/Menu Screens
import CreditReportRequestForm from '../Screens/CreditReport';

// --- Navigator Definitions ---
// Create navigators for different sections of the app
const Tab = createBottomTabNavigator();
const CalculatorStack = createStackNavigator();
const MenuStack = createStackNavigator();
const TipsStack = createStackNavigator();
const HomeStack = createStackNavigator();

/**
 * Home Stack Navigator
 * Handles navigation between the main home screen and account transaction details
 */
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeScreen" component={Home} />
    <HomeStack.Screen name="AccountTransactions" component={AccountTransactionsScreen} />
  </HomeStack.Navigator>
);

/**
 * Finance Tips Stack Navigator
 * Manages navigation between the tips list and individual tip details
 */
const TipsStackNavigator = () => (
  <TipsStack.Navigator>
    <TipsStack.Screen
      name="FinanceTips"
      component={FinanceTips}
      options={{ title: 'Finance Tips' }}
    />
    <TipsStack.Screen
      name="FinanceTipDetail"
      component={FinanceTipDetail}
      options={({ route }) => ({ title: route.params.tip.title })}
    />
  </TipsStack.Navigator>
);

/**
 * Calculator Stack Navigator
 * Provides navigation between the calculator list and individual calculator screens
 */
const CalculatorStackNavigator = () => (
  <CalculatorStack.Navigator>
    <CalculatorStack.Screen
      name="Calculators"
      component={Calculators}
      options={{ title: 'Financial Calculators' }}
    />
    {/* Individual Calculator Screens */}
    <CalculatorStack.Screen name="Mortgage" component={MortgageCalculator} options={{ title: 'Mortgage Calculator' }} />
    <CalculatorStack.Screen name="BuyVsRent" component={BuyVsRentCalculator} options={{ title: 'Buy vs. Rent' }}/>
    <CalculatorStack.Screen name="Car Loan" component={CarLoanCalculator} options={{ title: 'Car Loan Calculator' }}/>
    <CalculatorStack.Screen name="StudentLoan" component={StudentLoanCalculator} options={{ title: 'Student Loan Calculator' }}/>
    <CalculatorStack.Screen name="Grocery" component={GroceryCalculator} options={{ title: 'Grocery Calculator' }}/>
    <CalculatorStack.Screen name="Debt" component={DebtCalculator} options={{ title: 'Debt Calculator' }}/>
    <CalculatorStack.Screen name="Travel" component={TravelCalculator} options={{ title: 'Travel Calculator' }}/>
  </CalculatorStack.Navigator>
);

/**
 * Menu Stack Navigator
 * Handles navigation for settings and additional features
 */
const MenuStackNavigator = () => (
  <MenuStack.Navigator>
    <MenuStack.Screen
      name="Settings"
      component={Settings}
      options={{ title: 'More Options' }}
    />
    <MenuStack.Screen
      name="CreditReport"
      component={CreditReportRequestForm}
      options={{ title: 'Credit Report Request' }}
    />
  </MenuStack.Navigator>
);

/**
 * Main Bottom Tab Navigator
 * Configures the primary navigation structure with tabs for different app sections
 */
const AppNavigator = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={{
      // Tab bar styling
      tabBarActiveTintColor: '#3B82F6',    // Active tab color (Blue-500)
      tabBarInactiveTintColor: '#64748B',  // Inactive tab color (Slate-500)
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E5E7EB',
        borderTopWidth: 1,
      },
      tabBarLabelStyle: {
        fontSize: 12,
      },
      headerShown: false, // Hide headers for Tab screens (Stacks handle their own)
    }}
  >
    {/* Home Tab */}
    <Tab.Screen
      name="Home"
      component={HomeStackNavigator}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home-variant" color={color} size={size} />
        ),
      }}
    />

    {/* Finance Tips Tab */}
    <Tab.Screen
      name="TipsTab"
      component={TipsStackNavigator}
      options={{
        tabBarLabel: 'Tips',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="lightbulb-on" color={color} size={size} />
        ),
      }}
    />

    {/* Calculators Tab */}
    <Tab.Screen
      name="CalculatorsTab"
      component={CalculatorStackNavigator}
      options={{
        tabBarLabel: 'Calculators',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="calculator-variant" color={color} size={size} />
        ),
      }}
    />

    {/* Transactions Tab */}
    <Tab.Screen
      name="TransactionsTab"
      component={transactionsScreen}
      options={{
        tabBarLabel: 'Transactions',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="swap-horizontal" color={color} size={size} />
        ),
        headerShown: true,
        title: 'All Transactions'
      }}
    />

    {/* Budget Planner Tab */}
    <Tab.Screen
      name="BudgetTab"
      component={BudgetPlanner}
      options={{
        tabBarLabel: 'Budget',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="chart-pie" color={color} size={size} />
        ),
        headerShown: true,
        title: 'Budget Planner'
      }}
    />

    {/* More Options Tab */}
    <Tab.Screen
      name="MenuTab"
      component={MenuStackNavigator}
      options={{
        tabBarLabel: 'More',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="menu" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default AppNavigator;