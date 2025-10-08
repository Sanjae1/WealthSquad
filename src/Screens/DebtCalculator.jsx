import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native'
import React, { useState } from 'react'

const DebtCalculator = () => {
  // State to hold the list of debts
  const [debts, setDebts] = useState([]);

  // State for the input fields for a new debt
  const [debtName, setDebtName] = useState('');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minPayment, setMinPayment] = useState('');

  // State for the extra monthly payment
  const [extraPayment, setExtraPayment] = useState('');

  const handleAddDebt = () => {
    // Basic validation to ensure fields are not empty
    if (!debtName || !balance || !interestRate || !minPayment) {
      alert('Please fill in all fields.');
      return;
    }

    const newDebt = {
      id: Math.random().toString(), // A simple unique ID
      name: debtName,
      balance: parseFloat(balance),
      apr: parseFloat(interestRate),
      minPayment: parseFloat(minPayment),
    };

    setDebts(currentDebts => [...currentDebts, newDebt]);

    // Clear input fields after adding
    setDebtName('');
    setBalance('');
    setInterestRate('');
    setMinPayment('');
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debt Payoff Calculator</Text>

      {/* Input Form for New Debts */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Debt Name (e.g., Credit Card)"
          value={debtName}
          onChangeText={setDebtName}
        />
        <TextInput
          style={styles.input}
          placeholder="Remaining Balance ($)"
          value={balance}
          onChangeText={setBalance}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Interest Rate (APR %)"
          value={interestRate}
          onChangeText={setInterestRate}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Minimum Monthly Payment ($)"
          value={minPayment}
          onChangeText={setMinPayment}
          keyboardType="numeric"
        />
        <Button title="Add Debt" onPress={handleAddDebt} />
      </View>

      {/* List of Added Debts */}
      <FlatList
        data={debts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.debtItem}>
            <Text style={styles.debtName}>{item.name}</Text>
            <Text>Balance: ${item.balance.toFixed(2)}</Text>
            <Text>APR: {item.apr}% | Min. Payment: ${item.minPayment.toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debtItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debtName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});


export default DebtCalculator