// src/screens/BudgetPlanner.js
import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Keyboard,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

// --- Constants ---
const AppColors = {
  primary: '#4CAF50',
  danger: '#ff4444',
  text: '#333333',
  textSecondary: '#757575',
  placeholderText: '#A0A0A0',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  border: '#E0E0E0',
  lightText: '#FFFFFF',
};

const PIE_CHART_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
  '#FFB38E', '#79D1CF', '#C490D1', '#F3C89D', '#A1E7A1', '#EAA9BD'
];

const baseChartConfig = {
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Default color for chart text elements
  // backgroundColor, backgroundGradientFrom/To are not directly used by PieChart without a surrounding Chart component
};

const BudgetPlanner = () => {
  // --- State ---
  const [budgetInput, setBudgetInput] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // --- Refs ---
  const amountInputRef = useRef(null);

  // --- Memoized Derived Values ---
  const numericBudget = useMemo(() => {
    const parsed = parseFloat(budgetInput);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [budgetInput]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const remainingBalance = useMemo(() => {
    if (numericBudget > 0) {
      return numericBudget - totalExpenses;
    }
    // If no budget is set, "remaining" reflects total spending as a negative value
    return -totalExpenses;
  }, [numericBudget, totalExpenses]);

  const percentageUsed = useMemo(() => {
    if (numericBudget <= 0 || totalExpenses <= 0) return 0;
    return (totalExpenses / numericBudget) * 100;
  }, [numericBudget, totalExpenses]);

  const chartData = useMemo(() => {
    if (expenses.length === 0) return [];
    return expenses.map((expense, index) => ({
      name: expense.name,
      amount: expense.amount,
      color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
      legendFontColor: AppColors.textSecondary,
      legendFontSize: 12,
    }));
  }, [expenses]);

  // --- Callbacks ---
  const handleBudgetInputChange = useCallback((text) => {
    if (/^\d*\.?\d*$/.test(text) || text === '') { // Allow empty string to clear
      setBudgetInput(text);
    }
  }, []);

  const handleAddExpense = useCallback(() => {
    Keyboard.dismiss();
    const name = newExpenseName.trim();
    const amount = parseFloat(newExpenseAmount);

    if (!name) {
      Alert.alert('Invalid Name', 'Please enter a name for the expense.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount for the expense.');
      return;
    }

    setExpenses(prevExpenses => [
      ...prevExpenses,
      { id: Date.now(), name, amount },
    ]);
    setNewExpenseName('');
    setNewExpenseAmount('');
  }, [newExpenseName, newExpenseAmount]);

  const handleDeleteExpense = useCallback((id) => {
    setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
  }, []);

  // --- Dynamic Sizing ---
  const screenWidth = Dimensions.get('window').width;
  // Calculate available width for PieChart within its section
  const pieChartWidth = screenWidth - (styles.container.paddingHorizontal * 2) - (styles.section.paddingHorizontal * 2);

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Budget Input Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Set Your Monthly Budget</Text>
        <TextInput
          style={styles.input}
          placeholder={`e.g., 1500.00`}
          placeholderTextColor={AppColors.placeholderText}
          keyboardType="numeric"
          value={budgetInput}
          onChangeText={handleBudgetInputChange}
          onSubmitEditing={Keyboard.dismiss}
          returnKeyType="done"
        />
        {numericBudget > 0 && (
          <Text style={styles.inputHelperText}>
            Current Budget: ${numericBudget.toFixed(2)}
          </Text>
        )}
      </View>

      {/* Pie Chart Section */}
      {expenses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Breakdown</Text>
          <PieChart
            data={chartData}
            width={pieChartWidth}
            height={220}
            chartConfig={baseChartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15" // Internal padding for the chart
            // absolute // Uncomment to show absolute values in legend
          />
        </View>
      )}

      {/* Budget Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Budget:</Text>
          <Text style={styles.summaryAmount}>${numericBudget.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Expenses:</Text>
          <Text style={styles.summaryAmount}>${totalExpenses.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Remaining:</Text>
          <Text style={[
            styles.summaryAmount,
            remainingBalance < 0 && styles.overBudget,
          ]}>
            ${remainingBalance.toFixed(2)}
          </Text>
        </View>
        {numericBudget > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Percentage Used:</Text>
            <Text style={styles.summaryAmountPercentage}>{percentageUsed.toFixed(1)}%</Text>
          </View>
        )}
      </View>

      {/* Add Expense Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add New Expense</Text>
        <TextInput
          style={styles.input}
          placeholder="Expense Name (e.g., Groceries)"
          placeholderTextColor={AppColors.placeholderText}
          value={newExpenseName}
          onChangeText={setNewExpenseName}
          onSubmitEditing={() => amountInputRef.current?.focus()}
          returnKeyType="next"
          blurOnSubmit={false}
        />
        <TextInput
          ref={amountInputRef}
          style={styles.input}
          placeholder="Amount (e.g., 50.00)"
          placeholderTextColor={AppColors.placeholderText}
          keyboardType="numeric"
          value={newExpenseAmount}
          onChangeText={(text) => { // Allow only numbers and a single decimal point
            if (/^\d*\.?\d*$/.test(text) || text === '') {
              setNewExpenseAmount(text);
            }
          }}
          onSubmitEditing={handleAddExpense}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Expenses List Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expenses List</Text>
        {expenses.length === 0 ? (
          <Text style={styles.emptyListText}>No expenses added yet. Start by adding one above!</Text>
        ) : (
          expenses.map(expense => (
            <View key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseDetails}>
                <Text style={styles.expenseName}>{expense.name}</Text>
                <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteExpense(expense.id)} style={styles.deleteButton}>
                <Icon name="delete" size={24} color={AppColors.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16, // Horizontal padding for the screen
    paddingVertical: 8, // Vertical padding for top/bottom
    backgroundColor: AppColors.background,
  },
  section: {
    backgroundColor: AppColors.surface,
    borderRadius: 8,
    paddingHorizontal: 16, // Horizontal padding within sections
    paddingVertical: 16,   // Vertical padding within sections
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: AppColors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
    color: AppColors.text,
  },
  inputHelperText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 4, // Reduced margin
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.text,
  },
  summaryAmountPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  overBudget: {
    color: AppColors.danger,
  },
  addButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: AppColors.lightText,
    fontWeight: 'bold',
    fontSize: 16,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  expenseDetails: {
    flex: 1, // Ensure name can wrap if long
    marginRight: 8, // Space before delete icon
  },
  expenseName: {
    fontSize: 16,
    color: AppColors.text,
  },
  expenseAmount: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  deleteButton: {
    padding: 8, // Increases tappable area
  },
  emptyListText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default BudgetPlanner;