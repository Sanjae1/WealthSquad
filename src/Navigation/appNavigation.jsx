import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Screen Imports ---
import Home from '../Screens/Home';
import AccountTransactionsScreen from '../Screens/AccountTransactionsScreen';
import Calculators from '../Screens/Calculators';
import TransactionsScreen from '../Screens/TransactionsScreen';
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
import StudentLoanCalculator from '../Screens/StudentLoanCalculator';
import CreditCardPayoffCalculator from '../Screens/CreditCardPayoffCalculator';

// Additional Screens
import CreditReportRequestForm from '../Screens/CreditReport';
import BillPayDashboard from '../Screens/BillPayDashboard';
import SubscriptionDetails from '../Screens/SubscriptionDetails';
import SubscriptionTracker from '../Screens/SubscriptionTracker';
import PaymentHistory from '../Screens/PaymentHistory';
import NotificationSettings from '../Screens/NotificationSettings';
import BillDetails from '../Screens/BillDetails';
import PayBill from '../Screens/PayBill';
import AddBillerScreen from '../Screens/AddBillerScreen';

const Tab = createBottomTabNavigator();
const CalculatorStack = createStackNavigator();
const MenuStack = createStackNavigator();
const TipsStack = createStackNavigator();
const HomeStack = createStackNavigator();
const BillStack = createStackNavigator();

/**
 * Bill Pay Stack Navigator
 */
const BillStackNavigator = () => (
  <BillStack.Navigator>
    <BillStack.Screen
      name="BillPayDashboard"
      component={BillPayDashboard}
      options={{ headerShown: false }}
    />
    <BillStack.Screen name="SubscriptionDetails" component={SubscriptionDetails} options={{ title: 'Subscription' }} />
    <BillStack.Screen name="SubscriptionTracker" component={SubscriptionTracker} options={{ title: 'Subscriptions' }} />
    <BillStack.Screen name="PaymentHistory" component={PaymentHistory} options={{ title: 'History' }} />
    <BillStack.Screen name="NotificationSettings" component={NotificationSettings} options={{ title: 'Notifications' }} />
    <BillStack.Screen name="BillDetails" component={BillDetails} options={{ title: 'Bill Details' }} />
    <BillStack.Screen name="PayBill" component={PayBill} options={{ title: 'Pay Bill' }} />
    <BillStack.Screen name="AddBiller" component={AddBillerScreen} options={{ title: 'Add Biller' }} />
    <BillStack.Screen name="BudgetPlanner" component={BudgetPlanner} options={{ title: 'Budget' }} />
  </BillStack.Navigator>
);

/**
 * Home Stack Navigator
 */
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeScreen" component={Home} />
    <HomeStack.Screen name="AccountTransactions" component={AccountTransactionsScreen} />
  </HomeStack.Navigator>
);

/**
 * Menu Stack Navigator
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
    <MenuStack.Screen
      name="Calculators"
      component={Calculators}
      options={{ title: 'Financial Calculators' }}
    />
    <MenuStack.Screen name="Mortgage" component={MortgageCalculator} />
    <MenuStack.Screen name="BuyVsRent" component={BuyVsRentCalculator} />
    <MenuStack.Screen name="Car Loan" component={CarLoanCalculator} />
    <MenuStack.Screen name="StudentLoan" component={StudentLoanCalculator} />
    <MenuStack.Screen name="Grocery" component={GroceryCalculator} />
    <MenuStack.Screen name="Debt" component={DebtCalculator} />
    <MenuStack.Screen name="Travel" component={TravelCalculator} />
    <MenuStack.Screen name="CreditCardPayoff" component={CreditCardPayoffCalculator} />

    <MenuStack.Screen
      name="FinanceTips"
      component={FinanceTips}
    />
    <MenuStack.Screen
      name="FinanceTipDetail"
      component={FinanceTipDetail}
      options={({ route }) => ({ title: route.params.tip.title })}
    />
  </MenuStack.Navigator>
);

/**
 * Main Bottom Tab Navigator
 */
const AppNavigator = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={{
      tabBarActiveTintColor: '#3B82F6',
      tabBarInactiveTintColor: '#64748B',
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E5E7EB',
        borderTopWidth: 1,
      },
      tabBarLabelStyle: { fontSize: 12 },
      headerShown: false,
    }}
  >
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
    <Tab.Screen
      name="PlanningTab"
      component={BillStackNavigator}
      options={{
        tabBarLabel: 'Planning',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="calendar-check" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="MenuTab"
      component={MenuStackNavigator}
      options={{
        tabBarLabel: 'More',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="dots-horizontal" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default AppNavigator;
