/**
 * Calculators Component
 *
 * This component serves as the main entry point for all financial calculators in the app.
 * It displays a grid of available calculators and handles navigation to individual calculator screens.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Platform,
  StatusBar, // For Android status bar height
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Example icon set

// Import calculator screen components (assuming these are correctly pathed)
// import MortgageCalculator from '../Screens/MortgageCalculator';
// import BuyVsRentCalculator from '../Screens/BuyingVsRentingCalculator';
// import CarLoanCalculator from '../Screens/CarLoanCalculator';
// import DebtCalculator from '../Screens/DebtCalculator';
// import GroceryCalculator from '../Screens/GroceryCalculator';
// import TravelCalculator from '../Screens/TravelCalculator';
import StudentLoanCalculator from '../Components/StudentLoanCalculator'; // Note: This was ../Components, others ../Screens

const { width } = Dimensions.get('window');
const cardMargin = 8;
const numColumns = 2;
const cardWidth = (width - (numColumns + 1) * cardMargin * 2) / numColumns; // Calculate card width based on margins

const Calculators = () => {
  const navigation = useNavigation();

  const calculatorsData = [
    {
      title: 'Car Loan', // Shorter title for card
      fullName: 'Car Loan Calculator',
      route: 'Car Loan',
      iconName: 'car-side',
      color: '#4CAF50', // Example color
      description: 'Estimate your car payments.',
    },
    {
      title: 'Mortgage',
      fullName: 'Mortgage Calculator',
      route: 'Mortgage',
      iconName: 'home-city-outline',
      color: '#2196F3',
      description: 'Plan your home loan.',
    },
    {
      title: 'Buy vs Rent',
      fullName: 'Buying Vs Renting Calculator',
      route: 'BuyVsRent',
      iconName: 'home-switch-outline',
      color: '#FF9800',
      description: 'Compare owning vs renting.',
    },
    {
      title: 'Student Loan',
      fullName: 'Student Loan Calculator',
      route: 'StudentLoan',
      iconName: 'school-outline',
      color: '#9C27B0',
      description: 'Manage education loans.',
    },
    {
      title: 'Groceries',
      fullName: 'Grocery Calculator',
      route: 'Grocery',
      iconName: 'cart-outline',
      color: '#E91E63',
      description: 'Budget your grocery trips.',
    },
    {
      title: 'Debt Payoff',
      fullName: 'Debt Calculator',
      route: 'Debt',
      iconName: 'credit-card-off-outline',
      color: '#F44336',
      description: 'Strategize debt repayment.',
    },
    {
      title: 'Travel Budget',
      fullName: 'Travel Calculator',
      route: 'Travel',
      iconName: 'airplane-takeoff',
      color: '#00BCD4',
      description: 'Plan your trip expenses.',
    },
  ];

  const renderCalculatorCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: item.color }]}
      onPress={() => navigation.navigate(item.route)}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name={item.iconName} size={40} color="#fff" style={styles.cardIcon} />
      <Text style={styles.cardTitle}>{item.title}</Text>
      {item.description && <Text style={styles.cardDescription}>{item.description}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Financial Calculators</Text>
        <FlatList
          data={calculatorsData}
          renderItem={renderCalculatorCard}
          keyExtractor={(item) => item.route}
          numColumns={numColumns}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row} // Optional: for styling rows if needed
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5', // A lighter, softer background
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Handle Android status bar
  },
  container: {
    flex: 1,
    paddingHorizontal: cardMargin, // Use cardMargin for consistent outer padding
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 24,
    marginLeft: cardMargin, // Align with grid items
    // textAlign: 'center', // Alternative
  },
  gridContainer: {
    paddingBottom: cardMargin * 2, // Space at the bottom of the list
  },
  row: {
    // If you need to style the row itself, e.g., justifyContent: 'space-between'
    // For this flex-based card width, it's not strictly necessary but good for finer control
  },
  card: {
    width: cardWidth,
    height: cardWidth * 1.1, // Make cards slightly taller than wide
    margin: cardMargin,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    // Shadow (Android)
    elevation: 6,
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    paddingHorizontal: 5, // Prevent text from touching card edges
  },
});

export default Calculators;