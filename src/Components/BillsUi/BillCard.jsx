import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { MyColours } from '../../Utils/MyColours';
import {
    getBillerById,
    formatJMD,
    getDaysUntil,
    formatJamaicanDate
} from '../../Data/billers';
import {
    Zap,
    Droplets,
    Wifi,
    Smartphone,
    Tv,
    Shield,
    CreditCard,
    Landmark,
    Home,
    Building,
    GraduationCap,
    Lock,
    Music,
    Heart,
    FileText,
    AlertTriangle,
    Clock,
    CheckCircle2,
    ChevronRight,
    RefreshCw,
    Phone,
    Car,
    Route as Road,
    Newspaper,
    TrendingUp
} from 'lucide-react-native';

// Icon mapping for billers
const BILLER_ICONS = {
    jps: Zap,
    nwc: Droplets,
    rep: Zap,
    flow: Wifi,
    digicel: Smartphone,
    lime: Phone,
    jamaica_cable_vision: Tv,
    telstar: Tv,
    mars_cable: Tv,
    cornwall_communications: Tv,
    combined_communications: Tv,
    sagicor: Shield,
    sagicor_sigma: TrendingUp,
    guardian_life: Shield,
    advantage_general: Shield,
    lasco_financial: CreditCard,
    access_financial: CreditCard,
    cok_credit_union: Landmark,
    student_loan_bureau: GraduationCap,
    nht: Home,
    property_tax: Building,
    transport_authority: Car,
    highway_2000: Road,
    uwi: GraduationCap,
    utech: GraduationCap,
    ncu: GraduationCap,
    king_alarm: Lock,
    atlas_protection: Lock,
    guardsman: Lock,
    hawkeye: Lock,
    jamaica_observer: Newspaper,
    jacap: Music,
    jet: Heart,
    noble_wifi: Wifi,
    giant_networks: Wifi,
    citi_wireless: Wifi,
    innovera: Wifi,
    dekal_wireless: Wifi,
    default: FileText
};

const BillCard = ({ bill, onPress, isPaid = false, showHistory = false }) => {
    const biller = useMemo(() => getBillerById(bill.billerId), [bill.billerId]);
    const IconComponent = BILLER_ICONS[bill.billerId] || BILLER_ICONS.default;

    const daysUntil = getDaysUntil(bill.dueDate);
    const isOverdue = daysUntil < 0;

    // Calculate amount due (handles partial payments)
    const amountDue = bill.amountDue !== undefined ? bill.amountDue : bill.amount;
    const amountPaid = bill.amountPaid || 0;
    const isPartiallyPaid = amountPaid > 0 && amountPaid < bill.amount;

    // Payment status display
    const getStatusDisplay = () => {
        if (bill.status === 'paid') {
            const lastPayment = bill.payments?.[bill.payments.length - 1];
            return {
                text: 'Paid',
                color: MyColours.success || '#4CAF50',
                bgColor: '#E8F5E9',
                icon: CheckCircle2,
                date: lastPayment ? formatJamaicanDate(lastPayment.date) : null
            };
        }

        if (isOverdue) {
            return {
                text: `${Math.abs(daysUntil)} days overdue`,
                color: '#E53935',
                bgColor: '#FFEBEE',
                icon: AlertTriangle,
                date: null
            };
        }

        if (daysUntil === 0) {
            return {
                text: 'Due today',
                color: '#E67E22',
                bgColor: '#FFF3E0',
                icon: Clock,
                date: null
            };
        }

        if (daysUntil <= 3) {
            return {
                text: `Due in ${daysUntil} days`,
                color: '#E67E22',
                bgColor: '#FFF3E0',
                icon: Clock,
                date: null
            };
        }

        return {
            text: `Due ${formatJamaicanDate(bill.dueDate)}`,
            color: MyColours.textSecondary || '#757575',
            bgColor: '#F5F5F5',
            icon: Clock,
            date: null
        };
    };

    const status = getStatusDisplay();
    const StatusIcon = status.icon;

    return (
        <TouchableOpacity
            style={[
                styles.container,
                isPaid && styles.containerPaid,
                isOverdue && styles.containerOverdue,
                isPartiallyPaid && styles.containerPartial
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Main Card Content */}
            <View style={styles.mainContent}>
                {/* Left: Icon */}
                <View style={[
                    styles.iconContainer,
                    { backgroundColor: (biller?.brandColor || MyColours.primary || '#53b175') + '15' }
                ]}>
                    <IconComponent
                        size={22}
                        color={biller?.brandColor || MyColours.primary || '#53b175'}
                    />
                </View>

                {/* Middle: Info */}
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.billerName}>
                            {biller?.shortName || biller?.name || 'Unknown Biller'}
                        </Text>
                        {bill.nickname && (
                            <Text style={styles.nickname}> • {bill.nickname}</Text>
                        )}
                    </View>

                    <Text style={styles.accountNumber}>
                        Account {bill.accountNumber}
                    </Text>

                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                        <StatusIcon size={12} color={status.color} />
                        <Text style={[styles.statusText, { color: status.color }]}>
                            {status.text}
                        </Text>
                    </View>
                </View>

                {/* Right: Amount */}
                <View style={styles.amountContainer}>
                    <Text style={[
                        styles.amount,
                        isPaid && styles.amountPaid,
                        isOverdue && styles.amountOverdue
                    ]}>
                        {formatJMD(isPaid ? (bill.payments?.[0]?.amount || bill.amount) : amountDue)}
                    </Text>

                    {isPartiallyPaid && !isPaid && (
                        <Text style={styles.partialText}>
                            {formatJMD(amountPaid)} paid
                        </Text>
                    )}

                    <ChevronRight size={18} color={MyColours.textSecondary || '#757575'} />
                </View>
            </View>

            {/* Payment History Preview (if enabled) */}
            {showHistory && bill.payments && bill.payments.length > 0 && (
                <View style={styles.historyPreview}>
                    <View style={styles.historyDivider} />
                    <View style={styles.historyContent}>
                        <Text style={styles.historyTitle}>Payment History</Text>
                        {bill.payments.slice(0, 2).map((payment, idx) => (
                            <View key={payment.id || idx} style={styles.historyRow}>
                                <View style={styles.historyLeft}>
                                    <CheckCircle2 size={14} color={MyColours.success || '#4CAF50'} />
                                    <Text style={styles.historyDate}>
                                        {formatJamaicanDate(payment.date)}
                                    </Text>
                                </View>
                                <Text style={styles.historyAmount}>
                                    {formatJMD(payment.amount)}
                                </Text>
                            </View>
                        ))}
                        {bill.payments.length > 2 && (
                            <Text style={styles.historyMore}>
                                +{bill.payments.length - 2} more payments
                            </Text>
                        )}
                    </View>
                </View>
            )}

            {/* Autopay Indicator */}
            {bill.autopay && (
                <View style={styles.autopayBadge}>
                    <RefreshCw size={10} color={MyColours.success || '#4CAF50'} />
                    <Text style={styles.autopayText}>Autopay on</Text>
                </View>
            )}

            {/* Partial Payment Progress */}
            {isPartiallyPaid && !isPaid && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${(amountPaid / bill.amount) * 100}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {formatJMD(amountPaid)} of {formatJMD(bill.amount)}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    containerPaid: {
        borderColor: '#4CAF5040',
        backgroundColor: '#FAFAFA',
    },
    containerOverdue: {
        borderColor: '#E53935',
        borderLeftWidth: 4,
        borderLeftColor: '#E53935',
    },
    containerPartial: {
        borderColor: '#E67E22',
        borderLeftWidth: 3,
        borderLeftColor: '#E67E22',
    },
    mainContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    infoContainer: {
        flex: 1,
        marginRight: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    billerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    nickname: {
        fontSize: 14,
        color: '#757575',
        fontWeight: '500',
    },
    accountNumber: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    amountContainer: {
        alignItems: 'flex-end',
        gap: 4,
    },
    amount: {
        fontSize: 18,
        fontWeight: '800',
        color: '#333',
    },
    amountPaid: {
        color: '#4CAF50',
    },
    amountOverdue: {
        color: '#E53935',
    },
    partialText: {
        fontSize: 11,
        color: '#E67E22',
        fontWeight: '600',
    },
    // Payment History Preview
    historyPreview: {
        marginTop: 12,
    },
    historyDivider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginBottom: 12,
    },
    historyContent: {
        paddingLeft: 62, // Align with icon
    },
    historyTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#757575',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    historyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    historyDate: {
        fontSize: 13,
        color: '#757575',
    },
    historyAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    historyMore: {
        fontSize: 12,
        color: '#53b175',
        fontWeight: '600',
        marginTop: 4,
    },
    // Autopay
    autopayBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        marginTop: 10,
        marginLeft: 62,
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: '#E8F5E9',
        borderRadius: 6,
    },
    autopayText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4CAF50',
    },
    // Progress Bar
    progressContainer: {
        marginTop: 12,
        marginLeft: 62,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        marginBottom: 6,
    },
    progressFill: {
        height: 6,
        backgroundColor: '#E67E22',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#757575',
    },
});

export default BillCard;
