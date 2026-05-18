import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Modal,
    Share,
    SafeAreaView,
    Alert
} from 'react-native';
import { MyColours } from '../Utils/MyColours';
import {
    formatJMD,
    formatJamaicanDate,
    formatJamaicanDateTime,
    getBillerById,
    getTotalPaidThisMonth,
    getTotalPaidThisYear,
} from '../Data/billers';
import {
    ArrowLeft,
    Search,
    Download,
    Share2,
    Calendar,
    CreditCard,
    Wallet,
    Store,
    Hash,
    CheckCircle2,
    X,
    FileText,
    Landmark,
    Play,
    Music,
    Cloud,
    Code,
    Dumbbell,
    Newspaper,
    Utensils,
    Car,
    BookOpen,
    MoreHorizontal,
    Tv,
    Smartphone,
    Wifi,
    Lock,
    Heart,
    Home,
    GraduationCap,
    Building,
    Zap,
    Droplets,
    Gamepad
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';

const METHOD_ICONS = {
    lynk: Wallet,
    jnpay: Landmark,
    mycash: Store,
    lasco_gold: CreditCard,
    gk_one: CreditCard,
    card_visa: CreditCard,
    card_mastercard: CreditCard,
    agent_paymaster: Store,
    agent_bill_express: Store,
    ussd_flow: Hash,
    ussd_digicel: Hash
};

const ICON_MAP = {
    Play, Music, Cloud, Code, Dumbbell, Newspaper, Utensils, Car,
    BookOpen, MoreHorizontal, Tv, Smartphone, Wifi, Lock, Heart, Home,
    GraduationCap, Building, Zap, Droplets, Gamepad
};

const PaymentHistory = ({ route }) => {
    const navigation = useNavigation();
    const { bills = [], subscriptions = [] } = route.params || {};
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMethod, setFilterMethod] = useState(null);
    const [filterBiller, setFilterBiller] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [dateRange, setDateRange] = useState('all'); // all, month, year

    // Collect all payments from bills and subscriptions
    const allPayments = useMemo(() => {
        const payments = [];

        bills.forEach(bill => {
            bill.payments?.forEach(payment => {
                payments.push({
                    ...payment,
                    sourceType: 'bill',
                    sourceId: bill.id,
                    billerId: bill.billerId,
                    billerName: getBillerById(bill.billerId)?.shortName || 'Unknown',
                    billerIcon: getBillerById(bill.billerId)?.icon || 'file-text',
                    accountNumber: bill.accountNumber,
                    nickname: bill.nickname
                });
            });
        });

        subscriptions.forEach(sub => {
            sub.paymentHistory?.forEach(payment => {
                payments.push({
                    ...payment,
                    sourceType: 'subscription',
                    sourceId: sub.id,
                    subscriptionName: sub.name,
                    subscriptionIcon: sub.icon,
                    subscriptionColor: sub.brandColor
                });
            });
        });

        return payments.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [bills, subscriptions]);

    // Filtered payments
    const filteredPayments = useMemo(() => {
        let filtered = [...allPayments];

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.billerName?.toLowerCase().includes(q) ||
                p.subscriptionName?.toLowerCase().includes(q) ||
                p.methodName?.toLowerCase().includes(q) ||
                p.reference?.toLowerCase().includes(q)
            );
        }

        // Method filter
        if (filterMethod) {
            filtered = filtered.filter(p => p.method === filterMethod);
        }

        // Biller filter
        if (filterBiller) {
            filtered = filtered.filter(p => p.billerId === filterBiller);
        }

        // Date range filter
        const now = new Date();
        if (dateRange === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            filtered = filtered.filter(p => new Date(p.date) >= startOfMonth);
        } else if (dateRange === 'year') {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            filtered = filtered.filter(p => new Date(p.date) >= startOfYear);
        }

        return filtered;
    }, [allPayments, searchQuery, filterMethod, filterBiller, dateRange]);

    // Group by date
    const groupedPayments = useMemo(() => {
        const groups = {};
        filteredPayments.forEach(payment => {
            const dateKey = payment.date;
            if (!groups[dateKey]) {
                groups[dateKey] = {
                    date: dateKey,
                    payments: [],
                    total: 0
                };
            }
            groups[dateKey].payments.push(payment);
            groups[dateKey].total += payment.amount;
        });
        return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [filteredPayments]);

    // Stats
    const stats = useMemo(() => {
        const totalThisMonth = getTotalPaidThisMonth(allPayments);
        const totalThisYear = getTotalPaidThisYear(allPayments);
        const totalCount = allPayments.length;

        return { totalThisMonth, totalThisYear, totalCount };
    }, [allPayments]);

    const handleShareReceipt = async (payment) => {
        try {
            await Share.share({
                message: `Payment Receipt\n` +
                    `Reference: ${payment.reference}\n` +
                    `Amount: ${formatJMD(payment.amount)}\n` +
                    `Date: ${formatJamaicanDate(payment.date)}\n` +
                    `Method: ${payment.methodName}\n` +
                    `${payment.billerName || payment.subscriptionName}`,
                title: 'Payment Receipt'
            });
        } catch (err) {
            console.error('Share error:', err);
        }
    };

    const handleDownloadReceipt = (payment) => {
        Alert.alert('Receipt Downloaded', `Receipt ${payment.reference} saved to device.`);
    };

    const renderPaymentCard = ({ item: payment }) => {
        const isBill = payment.sourceType === 'bill';
        const IconComponent = isBill
            ? (METHOD_ICONS[payment.method] || CreditCard)
            : (ICON_MAP[payment.subscriptionIcon] || CreditCard);

        return (
            <TouchableOpacity
                style={styles.paymentCard}
                onPress={() => {
                    setSelectedPayment(payment);
                    setShowReceiptModal(true);
                }}
            >
                <View style={styles.paymentLeft}>
                    <View style={[
                        styles.paymentIconBg,
                        { backgroundColor: isBill ? (MyColours.primary || '#53b175') + '15' : payment.subscriptionColor + '15' }
                    ]}>
                        <IconComponent
                            size={20}
                            color={isBill ? (MyColours.primary || '#53b175') : payment.subscriptionColor}
                        />
                    </View>
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentName}>
                            {isBill ? payment.billerName : payment.subscriptionName}
                        </Text>
                        <Text style={styles.paymentMethod}>
                            {payment.methodName} • {formatJamaicanDate(payment.date)}
                        </Text>
                        {payment.reference && (
                            <Text style={styles.paymentReference}>Ref: {payment.reference}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.paymentRight}>
                    <Text style={styles.paymentAmount}>{formatJMD(payment.amount)}</Text>
                    <View style={[
                        styles.paymentStatusBadge,
                        payment.status === 'completed' && styles.statusCompleted
                    ]}>
                        <Text style={styles.paymentStatusText}>
                            {payment.status === 'completed' ? 'Paid' : payment.status}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderDayGroup = ({ item: group }) => (
        <View style={styles.dayGroup}>
            <View style={styles.dayGroupHeader}>
                <Text style={styles.dayGroupDate}>{formatJamaicanDate(group.date)}</Text>
                <Text style={styles.dayGroupTotal}>{formatJMD(group.total)}</Text>
            </View>
            <FlatList
                data={group.payments}
                renderItem={renderPaymentCard}
                keyExtractor={item => item.id}
                scrollEnabled={false}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment History</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>This Month</Text>
                        <Text style={styles.statValue}>{formatJMD(stats.totalThisMonth)}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>This Year</Text>
                        <Text style={styles.statValue}>{formatJMD(stats.totalThisYear)}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total</Text>
                        <Text style={styles.statValue}>{stats.totalCount}</Text>
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateFilter}>
                    {[
                        { id: 'all', label: 'All Time' },
                        { id: 'year', label: 'This Year' },
                        { id: 'month', label: 'This Month' }
                    ].map(range => (
                        <TouchableOpacity
                            key={range.id}
                            style={[styles.dateChip, dateRange === range.id && styles.dateChipActive]}
                            onPress={() => setDateRange(range.id)}
                        >
                            <Text style={[styles.dateChipText, dateRange === range.id && styles.dateChipTextActive]}>
                                {range.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {groupedPayments.length === 0 ? (
                    <View style={styles.emptyState}>
                        <FileText size={48} color="#757575" />
                        <Text style={styles.emptyStateText}>No payments found</Text>
                    </View>
                ) : (
                    <FlatList
                        data={groupedPayments}
                        renderItem={renderDayGroup}
                        keyExtractor={item => item.date}
                        scrollEnabled={false}
                        contentContainerStyle={styles.paymentsList}
                    />
                )}
            </ScrollView>

            <Modal
                visible={showReceiptModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowReceiptModal(false)}
            >
                <View style={styles.receiptOverlay}>
                    <View style={styles.receiptContent}>
                        {selectedPayment && (
                            <>
                                <View style={styles.receiptHeader}>
                                    <Text style={styles.receiptTitle}>Receipt</Text>
                                    <TouchableOpacity onPress={() => setShowReceiptModal(false)}>
                                        <X size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.receiptBody}>
                                    <View style={styles.qrContainer}>
                                        <QRCode
                                            value={JSON.stringify({
                                                ref: selectedPayment.reference,
                                                amount: selectedPayment.amount,
                                                date: selectedPayment.date,
                                                method: selectedPayment.method
                                            })}
                                            size={150}
                                            color="#333"
                                            backgroundColor="#fff"
                                        />
                                        <Text style={styles.qrLabel}>Scan to verify</Text>
                                    </View>

                                    <View style={styles.receiptCard}>
                                        <View style={styles.receiptRow}>
                                            <Text style={styles.receiptLabel}>Reference</Text>
                                            <Text style={styles.receiptValue}>{selectedPayment.reference}</Text>
                                        </View>
                                        <View style={styles.receiptDivider} />
                                        <View style={styles.receiptRow}>
                                            <Text style={styles.receiptLabel}>Amount</Text>
                                            <Text style={[styles.receiptValue, styles.receiptAmount]}>
                                                {formatJMD(selectedPayment.amount)}
                                            </Text>
                                        </View>
                                        <View style={styles.receiptDivider} />
                                        <View style={styles.receiptRow}>
                                            <Text style={styles.receiptLabel}>Date</Text>
                                            <Text style={styles.receiptValue}>
                                                {formatJamaicanDateTime(selectedPayment.date)}
                                            </Text>
                                        </View>
                                        <View style={styles.receiptDivider} />
                                        <View style={styles.receiptRow}>
                                            <Text style={styles.receiptLabel}>Method</Text>
                                            <Text style={styles.receiptValue}>{selectedPayment.methodName}</Text>
                                        </View>
                                    </View>
                                </ScrollView>

                                <View style={styles.receiptFooter}>
                                    <TouchableOpacity
                                        style={styles.receiptBtn}
                                        onPress={() => handleShareReceipt(selectedPayment)}
                                    >
                                        <Share2 size={18} color="#53b175" />
                                        <Text style={styles.receiptBtnText}>Share</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.receiptBtn, styles.receiptBtnPrimary]}
                                        onPress={() => handleDownloadReceipt(selectedPayment)}
                                    >
                                        <Download size={18} color="#fff" />
                                        <Text style={[styles.receiptBtnText, styles.receiptBtnTextPrimary]}>
                                            Download
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    statLabel: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#333',
    },
    dateFilter: {
        marginBottom: 16,
    },
    dateChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    dateChipActive: {
        backgroundColor: '#53b175',
        borderColor: '#53b175',
    },
    dateChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#757575',
    },
    dateChipTextActive: {
        color: '#fff',
    },
    paymentsList: {
        paddingBottom: 24,
    },
    dayGroup: {
        marginBottom: 20,
    },
    dayGroupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    dayGroupDate: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    dayGroupTotal: {
        fontSize: 14,
        fontWeight: '700',
        color: '#53b175',
    },
    paymentCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paymentIconBg: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    paymentMethod: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 2,
    },
    paymentReference: {
        fontSize: 11,
        color: '#AAA',
    },
    paymentRight: {
        alignItems: 'flex-end',
    },
    paymentAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    paymentStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: '#E8F5E9',
    },
    paymentStatusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4CAF50',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#757575',
        marginTop: 12,
    },
    receiptOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    receiptContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: '85%',
    },
    receiptHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    receiptTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#333',
    },
    receiptBody: {
        padding: 20,
    },
    qrContainer: {
        alignItems: 'center',
        marginBottom: 24,
        padding: 20,
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
    },
    qrLabel: {
        marginTop: 12,
        fontSize: 13,
        color: '#757575',
    },
    receiptCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 20,
    },
    receiptRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    receiptLabel: {
        fontSize: 14,
        color: '#757575',
    },
    receiptValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    receiptAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: '#53b175',
    },
    receiptDivider: {
        height: 1,
        backgroundColor: '#EEEEEE',
    },
    receiptFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    receiptBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: 14,
        backgroundColor: '#F5F5F5',
    },
    receiptBtnPrimary: {
        backgroundColor: '#53b175',
    },
    receiptBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#53b175',
    },
    receiptBtnTextPrimary: {
        color: '#fff',
    },
});

export default PaymentHistory;
