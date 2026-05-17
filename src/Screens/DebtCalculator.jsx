import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    FlatList,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    Plus,
    Trash2,
    TrendingDown,
    DollarSign,
    Calendar,
    Info,
    ArrowUpRight,
    Filter,
    Calculator,
    Zap,
    Snowflake,
    AlertTriangle,
    Save
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { MyColours } from '../Utils/MyColours';

const { width } = Dimensions.get('window');

const DebtDashboard = () => {
    const navigation = useNavigation();

    // State
    const [debts, setDebts] = useState([]);
    const [strategy, setDebtStrategy] = useState('avalanche'); // 'avalanche' (APR) or 'snowball' (Balance)
    const [extraPayment, setExtraPayment] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [newDebt, setNewDebt] = useState({
        name: '',
        balance: '',
        apr: '',
        minPayment: '',
        currentPayment: '',
        dueDate: '20' // Default to 20th
    });

    // Calculated Values
    const totalBalance = useMemo(() =>
        debts.reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0),
    [debts]);

    const sortedDebts = useMemo(() => {
        const list = [...debts];
        if (strategy === 'avalanche') {
            return list.sort((a, b) => parseFloat(b.apr) - parseFloat(a.apr));
        }
        return list.sort((a, b) => parseFloat(a.balance) - parseFloat(b.balance));
    }, [debts, strategy]);

    // Simple payoff projection (approximate)
    const payoffStats = useMemo(() => {
        if (debts.length === 0) return null;

        let remainingBalance = totalBalance;
        let months = 0;
        let totalInterest = 0;
        const extra = parseFloat(extraPayment) || 0;

        // Simplified aggregate calculation for dashboard preview
        const weightedApr = debts.reduce((sum, d) => sum + (parseFloat(d.apr) * (parseFloat(d.balance) / totalBalance)), 0);
        const totalMonthlyPayment = debts.reduce((sum, d) => sum + (parseFloat(d.currentPayment) || parseFloat(d.minPayment) || 0), 0) + extra;

        if (totalMonthlyPayment <= (remainingBalance * (weightedApr/100/12))) {
            return { error: 'Payments too low to cover interest' };
        }

        while (remainingBalance > 0 && months < 360) {
            const interest = remainingBalance * (weightedApr / 100 / 12);
            totalInterest += interest;
            remainingBalance = remainingBalance + interest - totalMonthlyPayment;
            months++;
        }

        return { months, totalInterest, years: (months / 12).toFixed(1) };
    }, [debts, totalBalance, extraPayment]);

    const handleAddDebt = () => {
        if (!newDebt.name || !newDebt.balance || !newDebt.apr) {
            Alert.alert('Error', 'Please fill in Name, Balance, and APR');
            return;
        }
        setDebts([...debts, { ...newDebt, id: Date.now().toString() }]);
        setNewDebt({ name: '', balance: '', apr: '', minPayment: '', currentPayment: '', dueDate: '20' });
        setShowAddModal(false);
    };

    const deleteDebt = (id) => {
        setDebts(debts.filter(d => d.id !== id));
    };

    const formatCurrency = (val) => \`\$\${parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}\`;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft color="#333" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Debt Dashboard</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)}>
                    <Plus color={MyColours.primary} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Debt Balance</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(totalBalance)}</Text>

                    {payoffStats && !payoffStats.error && (
                        <View style={styles.payoffGrid}>
                            <View style={styles.payoffItem}>
                                <Calendar size={16} color="#fff" />
                                <Text style={styles.payoffText}>{payoffStats.months} Months to Freedom</Text>
                            </View>
                            <View style={styles.payoffItem}>
                                <TrendingDown size={16} color="#fff" />
                                <Text style={styles.payoffText}>{formatCurrency(payoffStats.totalInterest)} Est. Interest</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Strategy Toggles */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payoff Strategy</Text>
                    <View style={styles.strategyContainer}>
                        <TouchableOpacity
                            style={[styles.strategyBtn, strategy === 'avalanche' && styles.strategyBtnActive]}
                            onPress={() => setDebtStrategy('avalanche')}
                        >
                            <Zap size={18} color={strategy === 'avalanche' ? '#fff' : '#757575'} />
                            <Text style={[styles.strategyText, strategy === 'avalanche' && styles.strategyTextActive]}>Avalanche</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.strategyBtn, strategy === 'snowball' && styles.strategyBtnActive]}
                            onPress={() => setDebtStrategy('snowball')}
                        >
                            <Snowflake size={18} color={strategy === 'snowball' ? '#fff' : '#757575'} />
                            <Text style={[styles.strategyText, strategy === 'snowball' && styles.strategyTextActive]}>Snowball</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.strategyDesc}>
                        {strategy === 'avalanche'
                            ? 'Targeting highest interest rates first to save the most money.'
                            : 'Targeting lowest balances first for quick psychological wins.'}
                    </Text>
                </View>

                {/* "What-if" Calculator */}
                <View style={styles.whatIfCard}>
                    <View style={styles.whatIfHeader}>
                        <Calculator size={20} color={MyColours.primary} />
                        <Text style={styles.whatIfTitle}>Extra Monthly Payment</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                        <DollarSign size={16} color="#757575" />
                        <TextInput
                            style={styles.extraInput}
                            placeholder="Amount (e.g. 5000)"
                            keyboardType="numeric"
                            value={extraPayment}
                            onChangeText={setExtraPayment}
                        />
                    </View>
                    {parseFloat(extraPayment) > 0 && (
                        <Text style={styles.savingsAlert}>
                            <ArrowUpRight size={14} color={MyColours.success} /> This will save you significant time and interest!
                        </Text>
                    )}
                </View>

                {/* Debt List */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Your Debts</Text>
                        <Text style={styles.debtCount}>{debts.length}</Text>
                    </View>

                    {debts.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No debts added yet. Start by tapping the + icon.</Text>
                        </View>
                    ) : (
                        sortedDebts.map((debt, index) => (
                            <View key={debt.id} style={styles.debtCard}>
                                <View style={styles.debtCardTop}>
                                    <View>
                                        <Text style={styles.debtName}>{debt.name}</Text>
                                        <Text style={styles.debtDetails}>{debt.apr}% APR • Due on the {debt.dueDate}th</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => deleteDebt(debt.id)}>
                                        <Trash2 size={18} color="#E53935" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.debtCardBottom}>
                                    <View>
                                        <Text style={styles.debtLabel}>Balance</Text>
                                        <Text style={styles.debtValue}>{formatCurrency(debt.balance)}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.debtLabel}>Current Payment</Text>
                                        <Text style={styles.debtValue}>{formatCurrency(debt.currentPayment || debt.minPayment)}</Text>
                                    </View>
                                </View>
                                {index === 0 && (
                                    <View style={styles.priorityBadge}>
                                        <Text style={styles.priorityText}>Priority Target</Text>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Add Debt Modal (Simplified inline for demo) */}
            {showAddModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Debt</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Debt Name (e.g. Scotiabank Card)"
                            value={newDebt.name}
                            onChangeText={(v) => setNewDebt({...newDebt, name: v})}
                        />
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.modalInput, { flex: 1, marginRight: 8 }]}
                                placeholder="Balance"
                                keyboardType="numeric"
                                value={newDebt.balance}
                                onChangeText={(v) => setNewDebt({...newDebt, balance: v})}
                            />
                            <TextInput
                                style={[styles.modalInput, { flex: 1 }]}
                                placeholder="APR %"
                                keyboardType="numeric"
                                value={newDebt.apr}
                                onChangeText={(v) => setNewDebt({...newDebt, apr: v})}
                            />
                        </View>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Monthly Payment"
                            keyboardType="numeric"
                            value={newDebt.currentPayment}
                            onChangeText={(v) => setNewDebt({...newDebt, currentPayment: v})}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleAddDebt}>
                                <Text style={styles.saveBtnText}>Add Debt</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    content: { flex: 1, padding: 20 },
    summaryCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24, marginBottom: 20 },
    summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 4 },
    summaryValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 20 },
    payoffGrid: { flexDirection: 'row', gap: 16 },
    payoffItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 12 },
    payoffText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 8 },
    debtCount: { backgroundColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '700' },
    strategyContainer: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    strategyBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
    strategyBtnActive: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
    strategyText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    strategyTextActive: { color: '#fff' },
    strategyDesc: { fontSize: 12, color: '#757575', fontStyle: 'italic', paddingHorizontal: 4 },
    whatIfCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
    whatIfHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    whatIfTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12 },
    extraInput: { flex: 1, paddingVertical: 12, fontSize: 16, marginLeft: 8, color: '#1E293B', fontWeight: '600' },
    savingsAlert: { marginTop: 12, fontSize: 12, color: '#16A34A', fontWeight: '600' },
    debtCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    debtCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    debtName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    debtDetails: { fontSize: 12, color: '#757575', marginTop: 2 },
    debtCardBottom: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    debtLabel: { fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 },
    debtValue: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    priorityBadge: { position: 'absolute', top: -8, right: 16, backgroundColor: '#E67E22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    priorityText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { textAlign: 'center', color: '#94A3B8' },
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20, zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
    modalInput: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16 },
    row: { flexDirection: 'row' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
    cancelBtn: { padding: 14 },
    saveBtn: { backgroundColor: '#1E293B', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    saveBtnText: { color: '#fff', fontWeight: '700' }
});

export default DebtDashboard;
