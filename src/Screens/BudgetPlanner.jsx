// src/screens/BudgetPlanner.js
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BudgetPlanner = () => {
  const [budget, setBudget] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '' });

  const addExpense = () => {
    if (newExpense.name && newExpense.amount) {
      setExpenses([...expenses, {
        id: Date.now(),
        name: newExpense.name,
        amount: parseFloat(newExpense.amount)
      }]);
      setNewExpense({ name: '', amount: '' });
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = budget ? (budget - totalExpenses) : 0;
  const percentageUsed = budget ? (totalExpenses / budget * 100) : 0;

  const chartData = expenses.map(expense => ({
    name: expense.name,
    amount: expense.amount,
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    legendFontColor: '#7F7F7F',
    legendFontSize: 12
  }));

  return (
    <ScrollView style={styles.container}>
      {/* Budget Input Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Set Monthly Budget</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter budget amount"
          keyboardType="numeric"
          value={budget}
          onChangeText={setBudget}
        />
      </View>

      {/* Pie Chart Section */}
      {budget > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Breakdown</Text>
          <PieChart
            data={chartData}
            width={300}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>
      )}

      {/* Budget Summary */}
      <View style={styles.section}>
        <View style={styles.summaryRow}>
          <Text>Total Budget:</Text>
          <Text style={styles.amount}>${budget || 0}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Total Expenses:</Text>
          <Text style={styles.amount}>${totalExpenses.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Remaining:</Text>
          <Text style={[
            styles.amount,
            remaining < 0 && styles.overBudget
          ]}>
            ${remaining.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Percentage Used:</Text>
          <Text>{percentageUsed.toFixed(1)}%</Text>
        </View>
      </View>

      {/* Add Expense Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add New Expense</Text>
        <TextInput
          style={styles.input}
          placeholder="Expense name"
          value={newExpense.name}
          onChangeText={text => setNewExpense({...newExpense, name: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          keyboardType="numeric"
          value={newExpense.amount}
          onChangeText={text => setNewExpense({...newExpense, amount: text})}
        />
        <TouchableOpacity style={styles.addButton} onPress={addExpense}>
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Expenses List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expenses</Text>
        {expenses.map(expense => (
          <View key={expense.id} style={styles.expenseItem}>
            <View>
              <Text>{expense.name}</Text>
              <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteExpense(expense.id)}>
              <Icon name="delete" size={24} color="#ff4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amount: {
    fontWeight: 'bold',
  },
  overBudget: {
    color: '#ff4444',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  expenseAmount: {
    color: '#757575',
    marginTop: 4,
  },
});

export default BudgetPlanner;