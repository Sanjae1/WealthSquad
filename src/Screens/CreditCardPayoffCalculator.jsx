import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Keyboard,
    FlatList,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, CreditCard, RefreshCw, TrendingDown, Calendar, DollarSign, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { MyColours } from '../Utils/MyColours';

const CreditCardPayoffCalculator = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();

    const [balance, setBalance] = useState('');
    const [apr, setApr] = useState('');
    const [monthlyPayment, setMonthlyPayment] = useState('');
    const [result, setResult] = useState(null);
    const [showSchedule, setShowSchedule] = useState(false);
    const [showComparison, setShowComparison] = useState(false);

    const calculatePayoff = useCallback(() => {
        const bal = parseFloat(balance);
        const rate = parseFloat(apr) / 100 / 12;
        const pmt = parseFloat(monthlyPayment);

        if (!bal || !rate || !pmt || bal <= 0 || rate <= 0 || pmt <= 0) {
            setResult({ error: "Please enter valid positive numbers for all fields." });
            return;
        }

        // Check if payment covers interest
        const monthlyInterest = bal * rate;
        if (pmt <= monthlyInterest) {
            setResult({
                error: `Payment (\$${pmt.toFixed(2)}) must exceed monthly interest (\$${monthlyInterest.toFixed(2)}). Minimum payment: \$${(monthlyInterest + 0.01).toFixed(2)}`
            });
            return;
        }

        // Exact months calculation: N = -log(1 - (r * PV) / PMT) / log(1 + r)
        const exactMonths = -Math.log(1 - (rate * bal) / pmt) / Math.log(1 + rate);
        const totalMonths = Math.ceil(exactMonths);

        // Accurate total paid calculation
        // For the final month, payment is adjusted to exact remaining balance
        const fullMonths = Math.floor(exactMonths);
        const remainingAfterFullMonths = bal * Math.pow(1 + rate, fullMonths) - pmt * ((Math.pow(1 + rate, fullMonths) - 1) / rate);
        const finalPayment = remainingAfterFullMonths * (1 + rate);
        const totalPaid = (fullMonths * pmt) + finalPayment;
        const totalInterest = totalPaid - bal;

        // Generate amortization schedule
        const schedule = [];
        let runningBalance = bal;
        let totalInterestPaid = 0;

        for (let month = 1; month <= totalMonths; month++) {
            const interestPayment = runningBalance * rate;
            const principalPayment = month === totalMonths
                ? runningBalance
                : pmt - interestPayment;

            runningBalance -= principalPayment;
            totalInterestPaid += interestPayment;

            if (runningBalance < 0) runningBalance = 0;

            schedule.push({
                month,
                payment: month === totalMonths ? (principalPayment + interestPayment) : pmt,
                principal: principalPayment,
                interest: interestPayment,
                balance: runningBalance,
                totalInterest: totalInterestPaid,
            });
        }

        // Generate comparison data for different payment amounts
        const comparisonPayments = [pmt * 0.5, pmt * 0.75, pmt, pmt * 1.25, pmt * 1.5, pmt * 2].filter(p => p > monthlyInterest);
        const comparisons = comparisonPayments.map(payment => {
            const months = -Math.log(1 - (rate * bal) / payment) / Math.log(1 + rate);
            const totalMonths = Math.ceil(months);
            const totalPaid = months * payment; // Simplified for comparison
            return {
                monthlyPayment: payment,
                months: totalMonths,
                years: (totalMonths / 12).toFixed(1),
                totalInterest: totalPaid - bal,
                totalPaid,
                isCurrent: Math.abs(payment - pmt) < 0.01,
            };
        });

        setResult({
            months: totalMonths,
            years: (totalMonths / 12).toFixed(1),
            totalInterest,
            totalPaid,
            originalBalance: bal,
            apr: parseFloat(apr),
            monthlyPayment: pmt,
            monthlyInterest,
            schedule,
            comparisons,
        });

        setShowSchedule(false);
        setShowComparison(false);
        Keyboard.dismiss();
    }, [balance, apr, monthlyPayment]);

    const clear = () => {
        setBalance('');
        setApr('');
        setMonthlyPayment('');
        setResult(null);
        setShowSchedule(false);
        setShowComparison(false);
    };

    const formatCurrency = (value) => {
        return `\$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const renderScheduleItem = ({ item }) => (
        <View style={styles.scheduleRow}>
            <Text style={styles.scheduleCell}>{item.month}</Text>
            <Text style={styles.scheduleCell}>{formatCurrency(item.payment)}</Text>
            <Text style={[styles.scheduleCell, { color: '#10B981' }]}>{formatCurrency(item.principal)}</Text>
            <Text style={[styles.scheduleCell, { color: '#EF4444' }]}>{formatCurrency(item.interest)}</Text>
            <Text style={styles.scheduleCell}>{formatCurrency(item.balance)}</Text>
        </View>
    );

    const renderComparisonItem = ({ item }) => (
        <View style={[styles.comparisonRow, item.isCurrent && styles.comparisonRowActive]}>
            <View style={styles.comparisonCol}>
                <Text style={[styles.comparisonValue, item.isCurrent && styles.comparisonValueActive]}>
                    {formatCurrency(item.monthlyPayment)}
                </Text>
                <Text style={styles.comparisonLabel}>Monthly</Text>
            </View>
            <View style={styles.comparisonCol}>
                <Text style={[styles.comparisonValue, item.isCurrent && styles.comparisonValueActive]}>
                    {item.months} mo
                </Text>
                <Text style={styles.comparisonLabel}>{item.years} yrs</Text>
            </View>
            <View style={styles.comparisonCol}>
                <Text style={[styles.comparisonValue, item.isCurrent && styles.comparisonValueActive]}>
                    {formatCurrency(item.totalInterest)}
                </Text>
                <Text style={styles.comparisonLabel}>Interest</Text>
            </View>
            <View style={styles.comparisonCol}>
                <Text style={[styles.comparisonValue, item.isCurrent && styles.comparisonValueActive]}>
                    {formatCurrency(item.totalPaid)}
                </Text>
                <Text style={styles.comparisonLabel}>Total</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <ChevronLeft color="#1E293B" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Credit Card Payoff</Text>
                <TouchableOpacity
                    onPress={clear}
                    accessibilityLabel="Clear all fields"
                    accessibilityRole="button"
                >
                    <RefreshCw color="#64748B" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                {/* Result Card */}
                {result && !result.error && (
                    <View style={styles.resultCard}>
                        <View style={styles.resultRow}>
                            <View style={styles.resultMain}>
                                <Text style={styles.resultLabel}>Time to Pay Off</Text>
                                <Text style={styles.resultValue}>{result.months} Months</Text>
                                <Text style={styles.resultSubtext}>{result.years} Years</Text>
                            </View>
                            <View style={styles.iconContainer}>
                                <CreditCard size={32} color="#fff" />
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <DollarSign size={16} color="rgba(255,255,255,0.7)" />
                                <Text style={styles.statLabel}>Total Interest</Text>
                                <Text style={styles.statValue}>{formatCurrency(result.totalInterest)}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <TrendingDown size={16} color="rgba(255,255,255,0.7)" />
                                <Text style={styles.statLabel}>Total Paid</Text>
                                <Text style={styles.statValue}>{formatCurrency(result.totalPaid)}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.miniStatsRow}>
                            <View style={styles.miniStat}>
                                <Text style={styles.miniStatLabel}>Original Balance</Text>
                                <Text style={styles.miniStatValue}>{formatCurrency(result.originalBalance)}</Text>
                            </View>
                            <View style={styles.miniStat}>
                                <Text style={styles.miniStatLabel}>APR</Text>
                                <Text style={styles.miniStatValue}>{result.apr}%</Text>
                            </View>
                            <View style={styles.miniStat}>
                                <Text style={styles.miniStatLabel}>Monthly Payment</Text>
                                <Text style={styles.miniStatValue}>{formatCurrency(result.monthlyPayment)}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {result && result.error && (
                    <View style={styles.errorCard}>
                        <AlertTriangle size={20} color="#991B1B" />
                        <Text style={styles.errorText}>{result.error}</Text>
                    </View>
                )}

                {/* Comparison Section */}
                {result && !result.error && (
                    <View style={styles.sectionCard}>
                        <TouchableOpacity
                            style={styles.sectionHeader}
                            onPress={() => setShowComparison(!showComparison)}
                            accessibilityLabel="Toggle payment comparison"
                            accessibilityRole="button"
                        >
                            <Text style={styles.sectionTitle}>Payment Comparison</Text>
                            {showComparison ? <ChevronUp size={20} color="#1E293B" /> : <ChevronDown size={20} color="#1E293B" />}
                        </TouchableOpacity>

                        {showComparison && (
                            <View style={styles.comparisonContainer}>
                                <View style={styles.comparisonHeader}>
                                    <Text style={styles.comparisonHeaderText}>Monthly</Text>
                                    <Text style={styles.comparisonHeaderText}>Duration</Text>
                                    <Text style={styles.comparisonHeaderText}>Interest</Text>
                                    <Text style={styles.comparisonHeaderText}>Total</Text>
                                </View>
                                <FlatList
                                    data={result.comparisons}
                                    renderItem={renderComparisonItem}
                                    keyExtractor={(item, index) => `comp-${index}`}
                                    scrollEnabled={false}
                                />
                                <Text style={styles.comparisonNote}>Highlighted row shows your current payment plan</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Amortization Schedule */}
                {result && !result.error && (
                    <View style={styles.sectionCard}>
                        <TouchableOpacity
                            style={styles.sectionHeader}
                            onPress={() => setShowSchedule(!showSchedule)}
                            accessibilityLabel="Toggle amortization schedule"
                            accessibilityRole="button"
                        >
                            <View style={styles.sectionHeaderLeft}>
                                <Calendar size={18} color="#4F46E5" />
                                <Text style={styles.sectionTitle}>Payoff Schedule</Text>
                            </View>
                            {showSchedule ? <ChevronUp size={20} color="#1E293B" /> : <ChevronDown size={20} color="#1E293B" />}
                        </TouchableOpacity>

                        {showSchedule && (
                            <View style={styles.scheduleContainer}>
                                <View style={[styles.scheduleRow, styles.scheduleHeader]}>
                                    <Text style={styles.scheduleHeaderText}>Mo</Text>
                                    <Text style={styles.scheduleHeaderText}>Payment</Text>
                                    <Text style={styles.scheduleHeaderText}>Principal</Text>
                                    <Text style={styles.scheduleHeaderText}>Interest</Text>
                                    <Text style={styles.scheduleHeaderText}>Balance</Text>
                                </View>
                                <FlatList
                                    data={result.schedule}
                                    renderItem={renderScheduleItem}
                                    keyExtractor={(item) => `month-${item.month}`}
                                    scrollEnabled={false}
                                    maxToRenderPerBatch={12}
                                />
                            </View>
                        )}
                    </View>
                )}

                {/* Inputs */}
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Card Balance ($)</Text>
                        <TextInput
                            style={styles.input}
                            value={balance}
                            onChangeText={setBalance}
                            placeholder="5000"
                            keyboardType="decimal-pad"
                            returnKeyType="done"
                            accessibilityLabel="Enter card balance"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Interest Rate (APR %)</Text>
                        <TextInput
                            style={styles.input}
                            value={apr}
                            onChangeText={setApr}
                            placeholder="18.99"
                            keyboardType="decimal-pad"
                            returnKeyType="done"
                            accessibilityLabel="Enter annual percentage rate"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Monthly Payment ($)</Text>
                        <TextInput
                            style={styles.input}
                            value={monthlyPayment}
                            onChangeText={setMonthlyPayment}
                            placeholder="200"
                            keyboardType="decimal-pad"
                            returnKeyType="done"
                            accessibilityLabel="Enter monthly payment amount"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.calcButton}
                        onPress={calculatePayoff}
                        accessibilityLabel="Calculate payoff"
                        accessibilityRole="button"
                    >
                        <Text style={styles.calcButtonText}>Calculate Payoff</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    content: {
        padding: 20,
    },
    resultCard: {
        backgroundColor: '#4F46E5',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    resultMain: {
        flex: 1,
    },
    resultLabel: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    resultValue: {
        color: '#fff',
        fontSize: 36,
        fontWeight: '800',
        marginBottom: 2,
    },
    resultSubtext: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 15,
        fontWeight: '500',
    },
    iconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 14,
        borderRadius: 16,
        marginLeft: 12,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginVertical: 18,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
        marginBottom: 4,
    },
    statValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    miniStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    miniStat: {
        alignItems: 'center',
        flex: 1,
    },
    miniStatLabel: {
        color: 'rgba(255, 255, 255, 0.65)',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
    },
    miniStatValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    errorCard: {
        backgroundColor: '#FEF2F2',
        padding: 18,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FCA5A5',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    errorText: {
        color: '#991B1B',
        fontWeight: '600',
        fontSize: 14,
        flex: 1,
        lineHeight: 20,
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    comparisonContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    comparisonHeader: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    comparisonHeaderText: {
        flex: 1,
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    comparisonRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    comparisonRowActive: {
        backgroundColor: '#EEF2FF',
        borderRadius: 8,
        borderBottomWidth: 0,
        marginVertical: 2,
    },
    comparisonCol: {
        flex: 1,
        alignItems: 'center',
    },
    comparisonValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E293B',
    },
    comparisonValueActive: {
        color: '#4F46E5',
    },
    comparisonLabel: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 2,
    },
    comparisonNote: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
    },
    scheduleContainer: {
        paddingHorizontal: 12,
        paddingBottom: 16,
    },
    scheduleHeader: {
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        marginBottom: 4,
    },
    scheduleHeaderText: {
        flex: 1,
        fontSize: 10,
        fontWeight: '700',
        color: '#64748B',
        textAlign: 'center',
        paddingVertical: 8,
    },
    scheduleRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    scheduleCell: {
        flex: 1,
        fontSize: 12,
        color: '#334155',
        textAlign: 'center',
        fontWeight: '500',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '500',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    calcButton: {
        backgroundColor: '#1E293B',
        padding: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    calcButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

export default CreditCardPayoffCalculator;
