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
  FlatList
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import {
    Plus,
    Trash2,
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    LayoutGrid,
    Calendar,
    Wallet
} from 'lucide-react-native';
import { MyColours } from '../Utils/MyColours';

const { width } = Dimensions.get('window');

const PIE_CHART_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
  '#FFB38E', '#79D1CF', '#C490D1', '#F3C89D', '#A1E7A1', '#EAA9BD'
];

const BudgetPlanner = () => {
  // --- State ---
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', type: 'fixed' }); // 'fixed' or 'variable'
  const [showAddSection, setShowAddSection] = useState(false);

  // --- Computed Values ---
  const totalIncome = parseFloat(income) || 0;

  const totalExpenses = useMemo(() =>
    expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
  [expenses]);

  const fixedExpenses = useMemo(() =>
    expenses.filter(e => e.type === 'fixed').reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
  [expenses]);

  const variableExpenses = useMemo(() =>
    expenses.filter(e => e.type === 'variable').reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
  [expenses]);

  const remaining = totalIncome - totalExpenses;
  const percentUsed = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const chartData = useMemo(() => {
    if (expenses.length === 0) return [];
    return expenses.map((e, index) => ({
      name: e.name,
      amount: parseFloat(e.amount),
      color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  }, [expenses]);

  // --- Actions ---
  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) {
        Alert.alert('Error', 'Please enter name and amount');
        return;
    }
    setExpenses([...expenses, { ...newExpense, id: Date.now().toString() }]);
    setNewExpense({ name: '', amount: '', type: 'fixed' });
    Keyboard.dismiss();
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const formatCurrency = (val) => \`\$\${parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}\`;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Income Section */}
        <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Monthly Net Income</Text>
            <View style={styles.incomeInputWrapper}>
                <DollarSign size={24} color="#fff" />
                <TextInput
                    style={styles.incomeInput}
                    placeholder="Enter Income"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="numeric"
                    value={income}
                    onChangeText={setIncome}
                />
            </View>
            <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, {
                        width: \`\${Math.min(percentUsed, 100)}%\`,
                        backgroundColor: percentUsed > 90 ? '#EF4444' : '#10B981'
                    }]} />
                </View>
                <Text style={styles.progressText}>{percentUsed.toFixed(0)}% Budget Used</Text>
            </View>
        </View>

        {/* Summary Row */}
        <View style={styles.summaryRow}>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Remaining</Text>
                <Text style={[styles.statValue, { color: remaining < 0 ? '#EF4444' : '#10B981' }]}>
                    {formatCurrency(remaining)}
                </Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Expenses</Text>
                <Text style={styles.statValue}>{formatCurrency(totalExpenses)}</Text>
            </View>
        </View>

        {/* Alerts */}
        {percentUsed > 90 && (
            <View style={styles.alertBox}>
                <AlertCircle size={20} color="#EF4444" />
                <Text style={styles.alertText}>Warning: You have used over 90% of your income!</Text>
            </View>
        )}

        {/* Chart */}
        {expenses.length > 0 && (
            <View style={styles.chartCard}>
                <Text style={styles.sectionTitle}>Spending Breakdown</Text>
                <PieChart
                    data={chartData}
                    width={width - 40}
                    height={200}
                    chartConfig={{ color: (opacity = 1) => \`rgba(0, 0, 0, \${opacity})\` }}
                    accessor="amount"
                    backgroundColor="transparent"
                    paddingLeft="15"
                />
            </View>
        )}

        {/* Type Breakdown */}
        <View style={styles.breakdownContainer}>
            <View style={styles.breakdownItem}>
                <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
                <View>
                    <Text style={styles.breakdownLabel}>Fixed (Needs)</Text>
                    <Text style={styles.breakdownValue}>{formatCurrency(fixedExpenses)}</Text>
                </View>
            </View>
            <View style={styles.breakdownItem}>
                <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                <View>
                    <Text style={styles.breakdownLabel}>Variable (Wants)</Text>
                    <Text style={styles.breakdownValue}>{formatCurrency(variableExpenses)}</Text>
                </View>
            </View>
        </View>

        {/* Add Expense Form */}
        <View style={styles.card}>
            <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => setShowAddSection(!showAddSection)}
            >
                <Text style={styles.sectionTitle}>Add Expense</Text>
                {showAddSection ? <ChevronUp size={20} color="#333" /> : <ChevronDown size={20} color="#333" />}
            </TouchableOpacity>

            {showAddSection && (
                <View style={styles.addForm}>
                    <TextInput
                        style={styles.input}
                        placeholder="Expense Name (e.g. Rent)"
                        value={newExpense.name}
                        onChangeText={(v) => setNewExpense({...newExpense, name: v})}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        keyboardType="numeric"
                        value={newExpense.amount}
                        onChangeText={(v) => setNewExpense({...newExpense, amount: v})}
                    />
                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[styles.typeBtn, newExpense.type === 'fixed' && styles.typeBtnActive]}
                            onPress={() => setNewExpense({...newExpense, type: 'fixed'})}
                        >
                            <Text style={[styles.typeBtnText, newExpense.type === 'fixed' && styles.typeBtnTextActive]}>Fixed</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeBtn, newExpense.type === 'variable' && styles.typeBtnActive]}
                            onPress={() => setNewExpense({...newExpense, type: 'variable'})}
                        >
                            <Text style={[styles.typeBtnText, newExpense.type === 'variable' && styles.typeBtnTextActive]}>Variable</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={addExpense}>
                        <Text style={styles.addBtnText}>Add Expense</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>

        {/* Expense List */}
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Expense List</Text>
            {expenses.length === 0 ? (
                <Text style={styles.emptyText}>No expenses yet. Add your fixed costs like rent or variable spending.</Text>
            ) : (
                expenses.map(e => (
                    <View key={e.id} style={styles.expenseItem}>
                        <View style={styles.expenseInfo}>
                            <View style={[styles.typeBadge, { backgroundColor: e.type === 'fixed' ? '#DBEAFE' : '#FEF3C7' }]}>
                                <Text style={[styles.typeText, { color: e.type === 'fixed' ? '#1E40AF' : '#92400E' }]}>{e.type}</Text>
                            </View>
                            <Text style={styles.expenseName}>{e.name}</Text>
                        </View>
                        <View style={styles.expenseActions}>
                            <Text style={styles.expenseAmount}>{formatCurrency(e.amount)}</Text>
                            <TouchableOpacity onPress={() => deleteExpense(e.id)} style={styles.deleteBtn}>
                                <Trash2 size={16} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20 },
  heroCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24, marginBottom: 20 },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  incomeInputWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  incomeInput: { flex: 1, fontSize: 32, fontWeight: '800', color: '#fff', marginLeft: 12 },
  progressContainer: { marginTop: 8 },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 8 },
  progressBarFill: { height: 8, borderRadius: 4 },
  progressText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  alertBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FECACA' },
  alertText: { color: '#991B1B', fontSize: 13, fontWeight: '600' },
  chartCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  breakdownContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  breakdownItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  breakdownValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addForm: { marginTop: 16 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16 },
  typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#1E293B' },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  typeBtnTextActive: { color: '#fff' },
  addBtn: { backgroundColor: '#53b175', padding: 16, borderRadius: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  expenseItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  expenseInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  expenseName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  expenseActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expenseAmount: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  deleteBtn: { padding: 4 },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 20, fontSize: 13, lineHeight: 18 }
});

export default BudgetPlanner;
