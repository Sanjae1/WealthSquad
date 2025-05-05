// navigation/AppNavigaton
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import CalculatorsScreen from '../screens/CalculatorsScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MortgageCalculator from '../Screens/MortgageCalculator';
import BuyVsRentCalculator from '../Screens/BuyingVsRentingCalculator';
import { CalculatorList } from '../components'; // Your calculator list component
import TransactionsScreen from '../Screens/transactionScreen';
import CarLoanCalculator from '../Screens/CarLoanCalculator';

const Tab = createBottomTabNavigator();
const CalculatorStack = createStackNavigator();
const MenuStack = createStackNavigator();

// Calculator Stack Navigator
const CalculatorStackNavigator = () => (
  <CalculatorStack.Navigator>
    <CalculatorStack.Screen 
      name="CalculatorList" 
      component={CalculatorList} 
      options={{ title: 'Financial Calculators' }}
    />
    <CalculatorStack.Screen name="Mortgage" component={MortgageCalculator} />
    <CalculatorStack.Screen name="BuyVsRent" component={BuyVsRentCalculator} />
    <CalculatorStack.Screen name="StudentLoan" component={StudentLoanCalculator} />
    <CalculatorStack.Screen name="Travel" component={TravelCalculator} />
    <CalculatorStack.Screen name="Car Loan" component={CarLoanCalculator} />
  </CalculatorStack.Navigator>
);

<Stack.transactionScreen name="Transaction" component={TransactionsScreen} ></Stack.transactionScreen>


// Menu Stack Navigator
const MenuStackNavigator = () => (
  <MenuStack.Navigator>
    <MenuStack.Screen 
      name="Settings" 
      component={SettingsScreen} 
      options={{ title: 'Account & Settings' }}
    />
  </MenuStack.Navigator>
);

const AppNavigator = () => (
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
      component={HomeScreen}
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
      component={CalculatorStackNavigator}
      options={{
        tabBarLabel: 'Calculators',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="calculator" color={color} size={26} />
        ),
        headerShown: false
      }}
    />

    <Tab.Screen 
      name="Expenses" 
      component={ExpensesScreen}
      options={{
        tabBarLabel: 'Expenses',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="cash" color={color} size={26} />
        ),
      }}
    />

    <Tab.Screen 
      name="Menu" 
      component={MenuStackNavigator}
      options={{
        tabBarLabel: 'More',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="menu" color={color} size={26} />
        ),
        headerShown: false
      }}
    />
  </Tab.Navigator>
);

export default AppNavigator;