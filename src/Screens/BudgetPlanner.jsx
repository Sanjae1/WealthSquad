// src/screens/BudgetPlanner.js
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'; // Added useEffect
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
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// --- Constants ---
const AppColors = {
  primary: '#4CAF50',
  secondary: '#36A2EB',
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
  clearGoalTitle: 'Clear Goal',
  clearGoalMessage: 'Are you sure you want to clear your current savings goal? This action cannot be undone.',
};

// --- AsyncStorage Keys ---
const STORAGE_KEYS = {
  BUDGET_INPUT: '@BudgetPlanner:budgetInput',
  EXPENSES: '@BudgetPlanner:expenses',
  SAVINGS_GOAL_NAME: '@BudgetPlanner:savingsGoalName',
  SAVINGS_GOAL_AMOUNT: '@BudgetPlanner:savingsGoalAmount',
  CURRENT_SAVED_AMOUNT: '@BudgetPlanner:currentSavedAmount',
};


// --- Reusable Sub-Components (ProgressBar, SectionCard, SummaryDetailRow, ExpenseListItem remain the same) ---
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

  const [isLoading, setIsLoading] = useState(true); // To show loading indicator if needed

  // --- Refs ---
  const amountInputRef = useRef(null);
  const goalAmountInputRef = useRef(null);
  const contributionAmountInputRef = useRef(null);

  // --- Data Loading Effect ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedBudgetInput = await AsyncStorage.getItem(STORAGE_KEYS.BUDGET_INPUT);
        const storedExpenses = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
        const storedSavingsGoalName = await AsyncStorage.getItem(STORAGE_KEYS.SAVINGS_GOAL_NAME);
        const storedSavingsGoalAmount = await AsyncStorage.getItem(STORAGE_KEYS.SAVINGS_GOAL_AMOUNT);
        const storedCurrentSavedAmount = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SAVED_AMOUNT);

        if (storedBudgetInput !== null) setBudgetInput(storedBudgetInput);
        if (storedExpenses !== null) setExpenses(JSON.parse(storedExpenses));
        if (storedSavingsGoalName !== null) {
            setSavingsGoalName(storedSavingsGoalName);
            setGoalNameInput(storedSavingsGoalName); // Pre-fill input
        }
        if (storedSavingsGoalAmount !== null) {
            const parsedAmount = parseFloat(storedSavingsGoalAmount);
            setSavingsGoalAmount(parsedAmount);
            setGoalAmountInput(parsedAmount.toString()); // Pre-fill input
        }
        if (storedCurrentSavedAmount !== null) setCurrentSavedAmount(parseFloat(storedCurrentSavedAmount));

      } catch (error) {
        console.error('Failed to load data from storage', error);
        Alert.alert('Error', 'Could not load saved data.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Data Saving Effects ---
  useEffect(() => {
    const saveData = async () => {
      try {
        if (!isLoading) { // Only save after initial load is complete
          await AsyncStorage.setItem(STORAGE_KEYS.BUDGET_INPUT, budgetInput);
        }
      } catch (error) { console.error('Failed to save budget input', error); }
    };
    saveData();
  }, [budgetInput, isLoading]);

  useEffect(() => {
    const saveData = async () => {
      try {
        if (!isLoading) {
          await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
        }
      } catch (error) { console.error('Failed to save expenses', error); }
    };
    saveData();
  }, [expenses, isLoading]);

  useEffect(() => {
    const saveData = async () => {
      try {
        if (!isLoading) {
          await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS_GOAL_NAME, savingsGoalName);
          await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS_GOAL_AMOUNT, savingsGoalAmount.toString());
          await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_SAVED_AMOUNT, currentSavedAmount.toString());
        }
      } catch (error) { console.error('Failed to save savings goal data', error); }
    };
    saveData();
  }, [savingsGoalName, savingsGoalAmount, currentSavedAmount, isLoading]);


  // --- Memoized Derived Values for Budget (remain the same) ---
  const numericBudget = useMemo(() => {
    const parsed = parseFloat(budgetInput);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [budgetInput]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const remainingBalance = useMemo(() => {
    if (numericBudget > 0) {
      const balance = numericBudget - totalExpenses;
      // If we want to consider contributions to savings as an "expense" from the budget
      // This part is for "More sophisticated handling of contributions"
      // const contributionAmount = parseFloat(contributionInput); // This would need more robust state for contributions
      // return balance - (isNaN(contributionAmount) ? 0 : contributionAmount);
      return balance;
    }
    return -totalExpenses;
  }, [numericBudget, totalExpenses]); // Add contributionInput or similar if linking

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

  // --- Memoized Derived Values for Savings Goal (remain the same) ---
  const savingsProgress = useMemo(() => {
    if (savingsGoalAmount <= 0) return 0;
    return currentSavedAmount / savingsGoalAmount;
  }, [currentSavedAmount, savingsGoalAmount]);

  const amountRemainingForGoal = useMemo(() => {
    return Math.max(0, savingsGoalAmount - currentSavedAmount);
  }, [savingsGoalAmount, currentSavedAmount]);


  // --- Callbacks for Budget & Expenses (remain the same) ---
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

    const isNewGoalSetup = !savingsGoalName;

    setSavingsGoalName(newName);
    setSavingsGoalAmount(newAmount);

    if (savingsGoalName !== newName || isNewGoalSetup) { // If name changed or new goal, reset saved amount
      setCurrentSavedAmount(0);
    } else {
      if (currentSavedAmount > newAmount) {
        setCurrentSavedAmount(newAmount);
      }
    }
    // Inputs are pre-filled by useEffect watching savingsGoalName/Amount
    // No need to setGoalNameInput/setGoalAmountInput here anymore if we load them from state

    Alert.alert(
        isNewGoalSetup ? ALERT_MESSAGES.goalSetTitle : ALERT_MESSAGES.goalUpdatedTitle,
        `Your savings goal "${newName}" for $${newAmount.toFixed(2)} has been ${isNewGoalSetup ? 'set' : 'updated'}.`
    );
  }, [goalNameInput, goalAmountInput, savingsGoalName, currentSavedAmount]);

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
        setContributionInput(''); // Clear input even if goal reached
        return;
    }

    // --- More sophisticated handling of contributions (Linking to budget) ---
    // This is a conceptual addition. Needs careful thought on UX.
    // Option 1: Deduct from remaining budget IF available
    // if (remainingBalance >= amount) {
    //   // This would require remainingBalance to be updated based on contributions
    //   // And a way to track "savings contributions" as a special type of expense
    //   // Or simply, the user understands their "remaining balance" is what's left *after* they decide to save
    // } else {
    //   Alert.alert("Insufficient Budget", "Your remaining budget is not enough for this contribution.");
    //   return;
    // }

    const newTotalSaved = currentSavedAmount + amount;
    setCurrentSavedAmount(Math.min(newTotalSaved, savingsGoalAmount));
    setContributionInput('');

    if (newTotalSaved >= savingsGoalAmount) {
        Alert.alert("Goal Reached!", `Congratulations! You've reached your goal: "${savingsGoalName}".`);
    } else {
        Alert.alert("Contribution Added", `$${amount.toFixed(2)} added to your goal: "${savingsGoalName}".`);
    }
  }, [contributionInput, currentSavedAmount, savingsGoalAmount, savingsGoalName, remainingBalance]); // Added remainingBalance

  const handleClearGoal = useCallback(() => {
    Alert.alert(
      ALERT_MESSAGES.clearGoalTitle,
      ALERT_MESSAGES.clearGoalMessage,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Goal",
          style: "destructive",
          onPress: () => {
            setSavingsGoalName('');
            setSavingsGoalAmount(0);
            setCurrentSavedAmount(0);
            setGoalNameInput('');
            setGoalAmountInput('');
            setContributionInput('');
            Alert.alert('Goal Cleared', 'Your savings goal has been removed.');
          }
        }
      ]
    );
  }, []);


  // --- Dynamic Sizing (remains the same) ---
  const screenWidth = Dimensions.get('window').width;
  const pieChartWidth = screenWidth - (SCREEN_HORIZONTAL_PADDING * 2) - (SECTION_HORIZONTAL_PADDING * 2);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading your budget...</Text>
        {/* You could add an ActivityIndicator here */}
      </View>
    );
  }

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
      <SectionCard title={savingsGoalName ? `Edit Goal: ${savingsGoalName}` : "Set a Savings Goal"}>
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
        {savingsGoalName && ( // Show Clear Goal button only if a goal is set
            <TouchableOpacity style={styles.dangerButton} onPress={handleClearGoal}>
                <Text style={styles.primaryButtonText}>Clear Goal</Text>
            </TouchableOpacity>
        )}
      </SectionCard>

      {/* Savings Goal Progress Display & Contribution Section */}
      {savingsGoalAmount > 0 && (
        <SectionCard title={`Goal Progress: ${savingsGoalName}`}>
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
                <Text style={styles.contributionTitle}>Make a Contribution:</Text>
              <TextInput
                ref={contributionAmountInputRef}
                style={styles.input}
                placeholder="Amount to save"
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
  loadingContainer: { // For loading state
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  primaryButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: AppColors.lightText,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: AppColors.secondary,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  dangerButton: { // For Clear Goal
    backgroundColor: AppColors.danger,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10, // Add some space
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
  savedAmountStyle: {
    color: AppColors.secondary,
    fontWeight: 'bold',
  },
  progressBarTrack: {
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 6,
  },
  progressBarFill: {
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'right',
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 16,
  },
  contributionSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: 16,
  },
  contributionTitle: { // Title for the contribution input area
    fontSize: 16,
    color: AppColors.text,
    marginBottom: 8,
    fontWeight: '600',
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