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
  secondary: '#36A2EB', // For savings goal progress
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
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

// --- UI & Message Constants ---
const SCREEN_HORIZONTAL_PADDING = 16;
const SECTION_HORIZONTAL_PADDING = 16;
const ALERT_MESSAGES = {
  invalidNameTitle: 'Invalid Name',
  invalidNameMessage: 'Please enter a name for the expense.',
  invalidAmountTitle: 'Invalid Amount',
  invalidAmountMessage: 'Please enter a valid positive amount for the expense.',
  invalidGoalNameTitle: 'Invalid Goal Name',
  invalidGoalNameMessage: 'Please enter a name for your savings goal.',
  invalidGoalAmountTitle: 'Invalid Goal Amount',
  invalidGoalAmountMessage: 'Please enter a valid positive amount for your goal.',
  goalSetTitle: 'Goal Set!',
  goalUpdatedTitle: 'Goal Updated!',
};

// --- Reusable Sub-Components ---

const SectionCard = ({ title, children, style }) => (
  <View style={[styles.section, style]}>
    {title && <Text style={styles.sectionTitle}>{title}</Text>}
    {children}
  </View>
);

const SummaryDetailRow = ({ label, value, valueStyle }) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={[styles.summaryAmount, valueStyle]}>{value}</Text>
  </View>
);

const ExpenseListItem = ({ expense, onDelete }) => (
  <View style={styles.expenseItem}>
    <View style={styles.expenseDetails}>
      <Text style={styles.expenseName}>{expense.name}</Text>
      <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
    </View>
    <TouchableOpacity
      onPress={() => onDelete(expense.id)}
      style={styles.deleteButton}
      accessibilityLabel={`Delete expense: ${expense.name}`}
    >
      <Icon name="delete" size={24} color={AppColors.danger} />
    </TouchableOpacity>
  </View>
);

// Simple ProgressBar Component
const ProgressBar = ({ progress, height = 10, barColor = AppColors.secondary, trackColor = AppColors.border }) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.progressBarTrack, { height, backgroundColor: trackColor }]}>
      <View style={[styles.progressBarFill, { width: `${clampedProgress * 100}%`, backgroundColor: barColor, height }]} />
    </View>
  );
};


const BudgetPlanner = () => {
  // --- State for Budget & Expenses ---
  const [budgetInput, setBudgetInput] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // --- State for Savings Goal ---
  const [savingsGoalName, setSavingsGoalName] = useState('');
  const [savingsGoalAmount, setSavingsGoalAmount] = useState(0);
  const [currentSavedAmount, setCurrentSavedAmount] = useState(0);
  const [goalNameInput, setGoalNameInput] = useState('');
  const [goalAmountInput, setGoalAmountInput] = useState('');
  const [contributionInput, setContributionInput] = useState('');


  // --- Refs ---
  const amountInputRef = useRef(null);
  const goalAmountInputRef = useRef(null);
  const contributionAmountInputRef = useRef(null);


  // --- Memoized Derived Values for Budget ---
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

  // --- Memoized Derived Values for Savings Goal ---
  const savingsProgress = useMemo(() => {
    if (savingsGoalAmount <= 0) return 0;
    return currentSavedAmount / savingsGoalAmount;
  }, [currentSavedAmount, savingsGoalAmount]);

  const amountRemainingForGoal = useMemo(() => {
    return Math.max(0, savingsGoalAmount - currentSavedAmount);
  }, [savingsGoalAmount, currentSavedAmount]);


  // --- Callbacks for Budget & Expenses ---
  const handleBudgetInputChange = useCallback((text) => {
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      setBudgetInput(text);
    }
  }, []);

  const handleExpenseAmountChange = useCallback((text) => {
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      setNewExpenseAmount(text);
    }
  }, []);

  const handleAddExpense = useCallback(() => {
    Keyboard.dismiss();
    const name = newExpenseName.trim();
    const amount = parseFloat(newExpenseAmount);

    if (!name) {
      Alert.alert(ALERT_MESSAGES.invalidNameTitle, ALERT_MESSAGES.invalidNameMessage);
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(ALERT_MESSAGES.invalidAmountTitle, ALERT_MESSAGES.invalidAmountMessage);
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

  // --- Callbacks for Savings Goal ---
  const handleGoalAmountInputChange = useCallback((text) => {
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      setGoalAmountInput(text);
    }
  }, []);

  const handleSetOrUpdateGoal = useCallback(() => {
    Keyboard.dismiss();
    const newName = goalNameInput.trim();
    const newAmount = parseFloat(goalAmountInput);

    if (!newName) {
      Alert.alert(ALERT_MESSAGES.invalidGoalNameTitle, ALERT_MESSAGES.invalidGoalNameMessage);
      return;
    }
    if (isNaN(newAmount) || newAmount <= 0) {
      Alert.alert(ALERT_MESSAGES.invalidGoalAmountTitle, ALERT_MESSAGES.invalidGoalAmountMessage);
      return;
    }

    const isNewGoalSetup = !savingsGoalName; // True if setting for the first time

    setSavingsGoalName(newName);
    setSavingsGoalAmount(newAmount);

    if (savingsGoalName !== newName) { // If name changed, it's effectively a new goal
      setCurrentSavedAmount(0);
    } else { // Name is same, amount might have changed
      if (currentSavedAmount > newAmount) {
        setCurrentSavedAmount(newAmount); // Cap progress if new goal target is smaller
      }
    }
    // Keep input fields populated for easy editing
    setGoalNameInput(newName);
    setGoalAmountInput(newAmount.toString());

    Alert.alert(
        isNewGoalSetup ? ALERT_MESSAGES.goalSetTitle : ALERT_MESSAGES.goalUpdatedTitle,
        `Your savings goal "${newName}" for $${newAmount.toFixed(2)} has been ${isNewGoalSetup ? 'set' : 'updated'}.`
    );
  }, [goalNameInput, goalAmountInput, savingsGoalName, currentSavedAmount]); // currentSavedAmount is needed to adjust it

  const handleContributionAmountChange = useCallback((text) => {
      if (text === '' || /^\d*\.?\d*$/.test(text)) {
        setContributionInput(text);
      }
  }, []);

  const handleAddContribution = useCallback(() => {
    Keyboard.dismiss();
    const amount = parseFloat(contributionInput);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert(ALERT_MESSAGES.invalidAmountTitle, "Please enter a valid positive amount to contribute.");
      return;
    }
    if (!savingsGoalAmount || savingsGoalAmount <= 0) {
        Alert.alert("No Goal Set", "Please set a savings goal before making a contribution.");
        return;
    }
    if (currentSavedAmount >= savingsGoalAmount) {
        Alert.alert("Goal Reached", "Congratulations! You've already reached your savings goal.");
        return;
    }

    const newTotalSaved = currentSavedAmount + amount;
    setCurrentSavedAmount(Math.min(newTotalSaved, savingsGoalAmount)); // Don't save more than the goal
    setContributionInput(''); // Clear input

    if (newTotalSaved >= savingsGoalAmount) {
        Alert.alert("Goal Reached!", `Congratulations! You've reached your goal: "${savingsGoalName}".`);
    } else {
        Alert.alert("Contribution Added", `$${amount.toFixed(2)} added to your goal: "${savingsGoalName}".`);
    }
  }, [contributionInput, currentSavedAmount, savingsGoalAmount, savingsGoalName]);


  // --- Dynamic Sizing ---
  const screenWidth = Dimensions.get('window').width;
  const pieChartWidth = screenWidth - (SCREEN_HORIZONTAL_PADDING * 2) - (SECTION_HORIZONTAL_PADDING * 2);

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Budget Input Section */}
      <SectionCard title="Set Your Monthly Budget">
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
      </SectionCard>

      {/* Pie Chart Section */}
      {expenses.length > 0 && (
        <SectionCard title="Expense Breakdown">
          <PieChart
            data={chartData}
            width={pieChartWidth}
            height={220}
            chartConfig={baseChartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </SectionCard>
      )}

      {/* Budget Summary Section */}
      <SectionCard title="Summary">
        <SummaryDetailRow
          label="Total Budget:"
          value={`$${numericBudget.toFixed(2)}`}
        />
        <SummaryDetailRow
          label="Total Expenses:"
          value={`$${totalExpenses.toFixed(2)}`}
        />
        <SummaryDetailRow
          label="Remaining Balance:"
          value={`$${remainingBalance.toFixed(2)}`}
          valueStyle={remainingBalance < 0 && styles.overBudget}
        />
        {numericBudget > 0 && (
          <SummaryDetailRow
            label="Percentage Used:"
            value={`${percentageUsed.toFixed(1)}%`}
            valueStyle={styles.summaryAmountPercentage}
          />
        )}
      </SectionCard>

      {/* Savings Goal Setup Section */}
      <SectionCard title={savingsGoalName ? `Edit: ${savingsGoalName}` : "Set a Savings Goal"}>
        <TextInput
          style={styles.input}
          placeholder="Goal Name (e.g., New Laptop)"
          placeholderTextColor={AppColors.placeholderText}
          value={goalNameInput}
          onChangeText={setGoalNameInput}
          returnKeyType="next"
          onSubmitEditing={() => goalAmountInputRef.current?.focus()}
          blurOnSubmit={false}
        />
        <TextInput
          ref={goalAmountInputRef}
          style={styles.input}
          placeholder="Target Amount (e.g., 1000)"
          placeholderTextColor={AppColors.placeholderText}
          keyboardType="numeric"
          value={goalAmountInput}
          onChangeText={handleGoalAmountInputChange}
          returnKeyType="done"
          onSubmitEditing={handleSetOrUpdateGoal}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleSetOrUpdateGoal}>
          <Text style={styles.primaryButtonText}>{savingsGoalName ? "Update Goal" : "Set Goal"}</Text>
        </TouchableOpacity>
      </SectionCard>

      {/* Savings Goal Progress Display & Contribution Section */}
      {savingsGoalAmount > 0 && (
        <SectionCard title={`Goal: ${savingsGoalName}`}>
          <SummaryDetailRow
            label="Target Amount:"
            value={`$${savingsGoalAmount.toFixed(2)}`}
          />
          <SummaryDetailRow
            label="Currently Saved:"
            value={`$${currentSavedAmount.toFixed(2)}`}
            valueStyle={styles.savedAmountStyle}
          />
          <SummaryDetailRow
            label="Remaining to Save:"
            value={`$${amountRemainingForGoal.toFixed(2)}`}
          />
          <ProgressBar progress={savingsProgress} />
          <Text style={styles.progressText}>
            {`${(savingsProgress * 100).toFixed(1)}% Complete`}
          </Text>

          {currentSavedAmount < savingsGoalAmount && (
            <View style={styles.contributionSection}>
              <TextInput
                ref={contributionAmountInputRef}
                style={styles.input}
                placeholder="Contribution Amount"
                placeholderTextColor={AppColors.placeholderText}
                keyboardType="numeric"
                value={contributionInput}
                onChangeText={handleContributionAmountChange}
                returnKeyType="done"
                onSubmitEditing={handleAddContribution}
              />
              <TouchableOpacity style={styles.secondaryButton} onPress={handleAddContribution}>
                <Text style={styles.primaryButtonText}>Add to Savings</Text>
              </TouchableOpacity>
            </View>
          )}
           {currentSavedAmount >= savingsGoalAmount && (
             <Text style={styles.goalReachedText}>🎉 Goal Reached! 🎉</Text>
           )}
        </SectionCard>
      )}


      {/* Add Expense Section */}
      <SectionCard title="Add New Expense">
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
          onChangeText={handleExpenseAmountChange}
          onSubmitEditing={handleAddExpense}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleAddExpense}>
          <Text style={styles.primaryButtonText}>Add Expense</Text>
        </TouchableOpacity>
      </SectionCard>

      {/* Expenses List Section */}
      <SectionCard title="Expenses List">
        {expenses.length === 0 ? (
          <Text style={styles.emptyListText}>No expenses added yet. Start by adding one above!</Text>
        ) : (
          expenses.map(expense => (
            <ExpenseListItem
              key={expense.id}
              expense={expense}
              onDelete={handleDeleteExpense}
            />
          ))
        )}
      </SectionCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: 8,
    backgroundColor: AppColors.background,
  },
  section: {
    backgroundColor: AppColors.surface,
    borderRadius: 8,
    paddingHorizontal: SECTION_HORIZONTAL_PADDING,
    paddingVertical: 16,
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
    marginBottom: 4,
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
  primaryButton: { // Renamed from addButton
    backgroundColor: AppColors.primary,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: { // Renamed from buttonText
    color: AppColors.lightText,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: AppColors.secondary, // Use a different color for "Add to Savings"
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
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
    flex: 1,
    marginRight: 8,
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
    padding: 8,
  },
  emptyListText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Styles for Savings Goal
  savedAmountStyle: {
    color: AppColors.secondary, // Highlight saved amount
    fontWeight: 'bold',
  },
  progressBarTrack: {
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 12, // Add some space above
    marginBottom: 6, // Add some space below
  },
  progressBarFill: {
    // height is set inline by component
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'right',
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 16, // Space before contribution section
  },
  contributionSection: {
    marginTop: 10, // Add some space above the contribution input
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: 16,
  },
  goalReachedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.primary,
    textAlign: 'center',
    marginTop: 16,
    paddingVertical: 10,
  }
});

export default BudgetPlanner;