import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MortgageCalculator from './MortgageCalculator';
import BuyVsRentCalculator from './BuyingVsRentingCalculator';
import CarLoanCalculator from './CarLoanCalculator';

const Calculators = () => {
  const navigation = useNavigation();
  const calculators = [
    { title: 'Car Loan Calculator', route: 'CarLoanCalculator' },
    { title: 'Mortgage Calculator', route: 'MortgageCalculator' },
    { title: 'Buying Vs Renting Calculator', route: 'BuyingVsRentingCalculator' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Financial Calculators</Text>
      <View style={styles.calculatorContainer}>
        {calculators.map((calculator, index) => (
          <TouchableOpacity
            key={index}
            style={styles.calculatorButton}
            onPress={() => navigation.navigate(calculator.route)}
          >
            <Text style={styles.calculatorButtonText}>{calculator.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  calculatorContainer: {
    width: '100%',
  },
  calculatorButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  calculatorButtonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
});

export default Calculators;