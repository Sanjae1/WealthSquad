import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Modal,
    Share,
    TextInput
} from 'react-native';
import { MyColours } from '../Utils/MyColours';
import {
    SUBSCRIPTION_BILLING_CYCLES,
    SUBSCRIPTION_CATEGORIES,
    formatJMD,
    formatUSD,
    formatJamaicanDate,
    getDaysUntil,
    getUrgencyLevel
} from '../Data/billers';
import {
    ArrowLeft,
    Edit3,
    Trash2,
    RefreshCw,
    Bell,
    BellOff,
    CreditCard,
    Calendar,
    TrendingUp,
    DollarSign,
    ChevronRight,
    CheckCircle2,
    AlertTriangle,
    Clock,
    X,
    Save,
    Share2,
    Download,
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
    Gamepad,
    Package,
    Film,
    Apple,
    PenTool,
    Layout,
    Bike,
    Activity
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';

// Icon mapping - keys are lowercase to match preset data
const ICON_MAP = {
    play: Play,
    music: Music,
    cloud: Cloud,
    code: Code,
    dumbbell: Dumbbell,
    newspaper: Newspaper,
    utensils: Utensils,
    car: Car,
    'book-open': BookOpen,
    'more-horizontal': MoreHorizontal,
    tv: Tv,
    smartphone: Smartphone,
    wifi: Wifi,
    lock: Lock,
    heart: Heart,
    home: Home,
    'graduation-cap': GraduationCap,
    building: Building,
    zap: Zap,
    droplets: Droplets,
    gamepad: Gamepad,
    package: Package,
    film: Film,
    apple: Apple,
    'pen-tool': PenTool,
    layout: Layout,
    bike: Bike,
    activity: Activity
};

const SubscriptionDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { subscription: initialSub, showCancel: showCancelIntent } = route.params || {};

    const [subscription, setSubscription] = useState(initialSub);
    const [isEditing, setIsEditing] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(showCancelIntent || false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    // Editable fields
    const [editName, setEditName] = useState(subscription?.name || '');
    const [editAmount, setEditAmount] = useState(String(subscription?.amount || ''));
    const [editCycle, setEditCycle] = useState(subscription?.billingCycle || 'monthly');
    const [editReminderDays, setEditReminderDays] = useState(String(subscription?.reminderDays || 3));
    const [editAutoRenew, setEditAutoRenew] = useState(subscription?.autoRenew ?? true);

    if (!subscription) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorState}>
                    <AlertTriangle size={48} color="#757575" />
                    <Text style={styles.errorText}>Subscription not found</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.errorBtn}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const IconComponent = ICON_MAP[subscription.icon] || MoreHorizontal;
    const daysUntil = getDaysUntil(subscription.nextBillingDate);
    const urgency = getUrgencyLevel(subscription.nextBillingDate);
    const category = SUBSCRIPTION_CATEGORIES.find(c => c.id === subscription.category);

    // Calculate costs
    const monthlyCost = useMemo(() => {
        const cycle = SUBSCRIPTION_BILLING_CYCLES[subscription.billingCycle];
        return cycle ? (subscription.amount * cycle.multiplier / 12) : subscription.amount;
    }, [subscription]);

    const annualCost = useMemo(() => {
        const cycle = SUBSCRIPTION_BILLING_CYCLES[subscription.billingCycle];
        return cycle ? (subscription.amount * cycle.multiplier) : subscription.amount * 12;
    }, [subscription]);

    // Total spent
    const totalSpent = useMemo(() =>
        subscription.paymentHistory?.reduce((sum, p) => sum + p.amount, 0) || 0,
        [subscription]
    );

    // Payment method display
    const getPaymentMethodDisplay = () => {
        const method = subscription.paymentMethod;
        if (!method) return 'Not set';

        if (method.type === 'card') {
            return `Card ending in ${method.last4}`;
        }
        if (method.type === 'lynk' || method.type === 'jnpay' || method.type === 'mycash') {
            return method.name || 'Mobile Wallet';
        }
        return method.name || 'Unknown';
    };

    const handleSave = () => {
        const updated = {
            ...subscription,
            name: editName,
            amount: parseFloat(editAmount) || subscription.amount,
            billingCycle: editCycle,
            reminderDays: parseInt(editReminderDays) || 3,
            autoRenew: editAutoRenew,
            updatedAt: new Date().toISOString()
        };

        setSubscription(updated);
        setIsEditing(false);

        // TODO: Save to AsyncStorage / API
        Alert.alert('Saved', 'Subscription updated successfully');
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancel Subscription',
            `Are you sure you want to cancel ${subscription.name}?

This will stop automatic renewals. You can still use the service until ${formatJamaicanDate(subscription.nextBillingDate)}.`,
            [
                { text: 'Keep Subscription', style: 'cancel' },
                {
                    text: 'Cancel Subscription',
                    style: 'destructive',
                    onPress: () => {
                        const cancelled = {
                            ...subscription,
                            status: 'cancelled',
                            autoRenew: false,
                            updatedAt: new Date().toISOString()
                        };
                        setSubscription(cancelled);
                        setShowCancelModal(false);

                        // TODO: Save to AsyncStorage / API
                        Alert.alert('Cancelled', `${subscription.name} has been cancelled. You'll receive service until ${formatJamaicanDate(subscription.nextBillingDate)}.`);
                    }
                }
            ]
        );
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Subscription',
            `Permanently remove ${subscription.name} from tracking?

Payment history will be lost.`,
            [
                { text: 'Keep', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Remove from AsyncStorage / API
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    const handleShareReceipt = async (payment) => {
        try {
            await Share.share({
                message: `Subscription Payment Receipt\n` +
                    `Service: ${subscription.name}\n` +
                    `Amount: ${formatJMD(payment.amount)}\n` +
                    `Date: ${formatJamaicanDate(payment.date)}\n` +
                    `Reference: ${payment.reference}`,
                title: 'Subscription Receipt'
            });
        } catch (err) {
            console.error('Share error:', err);
        }
    };

    const renderPaymentHistory = () => {
        if (!subscription.paymentHistory || subscription.paymentHistory.length === 0) {
            return (
                <View style={styles.emptyHistory}>
                    <Clock size={32} color="#757575" />
                    <Text style={styles.emptyHistoryText}>No payments yet</Text>
                    <Text style={styles.emptyHistorySubtext}>
                        Payments will appear after each renewal
                    </Text>
                </View>
            );
        }

        return subscription.paymentHistory.map((payment, index) => (
            <TouchableOpacity
                key={payment.id || index}
                style={styles.paymentRow}
                onPress={() => {
                    setSelectedPayment(payment);
                    setShowReceiptModal(true);
                }}
            >
                <View style={styles.paymentLeft}>
                    <View style={[styles.paymentIconBg, { backgroundColor: '#4CAF5015' }]}>
                        <CheckCircle2 size={16} color="#4CAF50" />
                    </View>
                    <View>
                        <Text style={styles.paymentDate}>{formatJamaicanDate(payment.date)}</Text>
                        <Text style={styles.paymentMethod}>{payment.method}</Text>
                    </View>
                </View>
                <View style={styles.paymentRight}>
                    <Text style={styles.paymentAmount}>{formatJMD(payment.amount)}</Text>
                    <ChevronRight size={16} color="#757575" />
                </View>
            </TouchableOpacity>
        ));
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscription</Text>
                <View style={styles.headerActions}>
                    {!isEditing ? (
                        <>
                            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerBtn}>
                                <Edit3 size={20} color="#53b175" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
                                <Trash2 size={20} color="#E53935" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
                            <Save size={20} color="#4CAF50" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Card */}
                <View style={[styles.heroCard, { borderTopColor: subscription.brandColor }]}>
                    <View style={styles.heroTop}>
                        <View style={[styles.heroIconBg, { backgroundColor: subscription.brandColor + '15' }]}>
                            <IconComponent size={32} color={subscription.brandColor} />
                        </View>
                        <View style={styles.heroStatus}>
                            <View style={[
                                styles.statusDot,
                                subscription.status === 'active' ? { backgroundColor: '#4CAF50' } :
                                subscription.status === 'cancelled' ? { backgroundColor: '#757575' } :
                                { backgroundColor: '#E67E22' }
                            ]} />
                            <Text style={styles.statusText}>
                                {subscription.status === 'active' ? 'Active' :
                                 subscription.status === 'cancelled' ? 'Cancelled' :
                                 subscription.status === 'paused' ? 'Paused' : 'Expired'}
                            </Text>
                        </View>
                    </View>

                    {isEditing ? (
                        <TextInput
                            style={styles.editNameInput}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Subscription name"
                        />
                    ) : (
                        <Text style={styles.heroName}>{subscription.name}</Text>
                    )}

                    <Text style={styles.heroCategory}>{category?.name || subscription.category}</Text>

                    {/* Renewal Info */}
                    <View style={styles.renewalInfo}>
                        {urgency === 'overdue' ? (
                            <AlertTriangle size={16} color="#E53935" />
                        ) : urgency === 'urgent' || urgency === 'today' ? (
                            <Clock size={16} color="#E67E22" />
                        ) : (
                            <Calendar size={16} color="#757575" />
                        )}
                        <Text style={[
                            styles.renewalText,
                            urgency === 'overdue' && styles.textOverdue,
                            (urgency === 'urgent' || urgency === 'today') && styles.textUrgent
                        ]}>
                            {daysUntil < 0 ? `Renewal overdue by ${Math.abs(daysUntil)} days` :
                             daysUntil === 0 ? 'Renews today' :
                             daysUntil === 1 ? 'Renews tomorrow' :
                             `Renews in ${daysUntil} days`}
                        </Text>
                    </View>

                    <Text style={styles.renewalDate}>
                        {formatJamaicanDate(subscription.nextBillingDate)}
                    </Text>
                </View>

                {/* Amount Card */}
                <View style={styles.amountCard}>
                    <View style={styles.amountRow}>
                        <View>
                            <Text style={styles.amountLabel}>Amount</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.editAmountInput}
                                    value={editAmount}
                                    onChangeText={setEditAmount}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            ) : (
                                <Text style={styles.amountValue}>{formatJMD(subscription.amount)}</Text>
                            )}
                        </View>
                        <View style={styles.amountRight}>
                            <Text style={styles.amountCycle}>
                                {SUBSCRIPTION_BILLING_CYCLES[subscription.billingCycle]?.label}
                            </Text>
                            {subscription.originalCurrency === 'USD' && (
                                <Text style={styles.amountUsd}>
                                    ≈ {formatUSD(subscription.originalAmount)}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Cycle selector when editing */}
                    {isEditing && (
                        <View style={styles.cycleSelector}>
                            {Object.entries(SUBSCRIPTION_BILLING_CYCLES).map(([key, cycle]) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[styles.cycleOption, editCycle === key && styles.cycleOptionActive]}
                                    onPress={() => setEditCycle(key)}
                                >
                                    <Text style={[styles.cycleOptionText, editCycle === key && styles.cycleOptionTextActive]}>
                                        {cycle.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Cost Breakdown */}
                <View style={styles.breakdownCard}>
                    <Text style={styles.breakdownTitle}>Cost Breakdown</Text>
                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Monthly equivalent</Text>
                        <Text style={styles.breakdownValue}>{formatJMD(monthlyCost)}</Text>
                    </View>
                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Annual cost</Text>
                        <Text style={styles.breakdownValue}>{formatJMD(annualCost)}</Text>
                    </View>
                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Total spent</Text>
                        <Text style={[styles.breakdownValue, { color: '#4CAF50' }]}>
                            {formatJMD(totalSpent)}
                        </Text>
                    </View>
                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Payments made</Text>
                        <Text style={styles.breakdownValue}>
                            {subscription.paymentHistory?.length || 0}
                        </Text>
                    </View>
                </View>

                {/* Settings */}
                <View style={styles.settingsCard}>
                    <Text style={styles.settingsTitle}>Settings</Text>

                    {/* Auto Renew */}
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <RefreshCw size={18} color="#53b175" />
                            <View>
                                <Text style={styles.settingLabel}>Auto-Renew</Text>
                                <Text style={styles.settingDesc}>
                                    Automatically charge {formatJMD(subscription.amount)} {subscription.billingCycle}
                                </Text>
                            </View>
                        </View>
                        {isEditing ? (
                            <TouchableOpacity
                                style={[styles.toggle, editAutoRenew && styles.toggleActive]}
                                onPress={() => setEditAutoRenew(!editAutoRenew)}
                            >
                                <View style={[styles.toggleThumb, editAutoRenew && styles.toggleThumbActive]} />
                            </TouchableOpacity>
                        ) : (
                            <View style={[styles.statusPill, subscription.autoRenew ? styles.pillActive : styles.pillInactive]}>
                                <Text style={[styles.pillText, subscription.autoRenew && styles.pillTextActive]}>
                                    {subscription.autoRenew ? 'On' : 'Off'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Reminder Days */}
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Bell size={18} color="#53b175" />
                            <View>
                                <Text style={styles.settingLabel}>Reminder</Text>
                                <Text style={styles.settingDesc}>
                                    {subscription.reminderDays} days before renewal
                                </Text>
                            </View>
                        </View>
                        {isEditing ? (
                            <TextInput
                                style={styles.editReminderInput}
                                value={editReminderDays}
                                onChangeText={setEditReminderDays}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                        ) : (
                            <Text style={styles.settingValue}>{subscription.reminderDays} days</Text>
                        )}
                    </View>

                    {/* Payment Method */}
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <CreditCard size={18} color="#53b175" />
                            <View>
                                <Text style={styles.settingLabel}>Payment Method</Text>
                                <Text style={styles.settingDesc}>{getPaymentMethodDisplay()}</Text>
                            </View>
                        </View>
                        <ChevronRight size={18} color="#757575" />
                    </View>
                </View>

                {/* Payment History */}
                <View style={styles.historyCard}>
                    <Text style={styles.historyTitle}>Payment History</Text>
                    {renderPaymentHistory()}
                </View>

                {/* Cancel Button (only for active subscriptions) */}
                {subscription.status === 'active' && !isEditing && (
                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => setShowCancelModal(true)}
                    >
                        <BellOff size={18} color="#E53935" />
                        <Text style={styles.cancelBtnText}>Cancel Subscription</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Cancel Confirmation Modal */}
            <Modal
                visible={showCancelModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCancelModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconBg}>
                            <BellOff size={32} color="#E53935" />
                        </View>
                        <Text style={styles.modalTitle}>Cancel {subscription.name}?</Text>
                        <Text style={styles.modalDesc}>
                            Your subscription will remain active until {formatJamaicanDate(subscription.nextBillingDate)}. After that, you won't be charged again.
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalBtnSecondary}
                                onPress={() => setShowCancelModal(false)}
                            >
                                <Text style={styles.modalBtnSecondaryText}>Keep Subscription</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalBtnDanger}
                                onPress={handleCancel}
                            >
                                <Text style={styles.modalBtnDangerText}>Cancel Subscription</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Receipt Modal */}
            <Modal
                visible={showReceiptModal}
                transparent
                animationType="slide"
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
                                    <View style={styles.receiptQrContainer}>
                                        <QRCode
                                            value={JSON.stringify({
                                                ref: selectedPayment.reference,
                                                service: subscription.name,
                                                amount: selectedPayment.amount,
                                                date: selectedPayment.date
                                            })}
                                            size={140}
                                            color="#333"
                                            backgroundColor="#fff"
                                        />
                                        <Text style={styles.receiptQrLabel}>Scan to verify</Text>
                                    </View>

                                    <View style={styles.receiptCard}>
                                        <View style={styles.receiptRow}>
                                            <Text style={styles.receiptLabel}>Reference</Text>
                                            <Text style={styles.receiptValue}>{selectedPayment.reference}</Text>
                                        </View>
                                        <View style={styles.receiptDivider} />
                                        <View style={styles.receiptRow}>
                                            <Text style={styles.receiptLabel}>Service</Text>
                                            <Text style={styles.receiptValue}>{subscription.name}</Text>
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
                                                {formatJamaicanDate(selectedPayment.date)}
                                            </Text>
                                        </View>
                                        <View style={styles.receiptDivider} />
                                        <View style={styles.receiptRow}>
                                            <Text style={styles.receiptLabel}>Method</Text>
                                            <Text style={styles.receiptValue}>{selectedPayment.method}</Text>
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
                                        onPress={() => {
                                            Alert.alert('Downloaded', 'Receipt saved to device');
                                            setShowReceiptModal(false);
                                        }}
                                    >
                                        <Download size={18} color="#fff" />
                                        <Text style={[styles.receiptBtnText, styles.receiptBtnTextPrimary]}>Download</Text>
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
    errorState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#757575',
        marginTop: 16,
        marginBottom: 20,
    },
    errorBtn: {
        fontSize: 16,
        fontWeight: '700',
        color: '#53b175',
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
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerBtn: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    // Hero Card
    heroCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderTopWidth: 4,
        alignItems: 'center',
    },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 16,
    },
    heroIconBg: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
    },
    heroName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    editNameInput: {
        fontSize: 24,
        fontWeight: '800',
        color: '#333',
        textAlign: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#53b175',
        paddingVertical: 4,
        minWidth: 200,
    },
    heroCategory: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 16,
    },
    renewalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    renewalText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#757575',
    },
    textOverdue: {
        color: '#E53935',
    },
    textUrgent: {
        color: '#E67E22',
    },
    renewalDate: {
        fontSize: 13,
        color: '#757575',
    },
    // Amount Card
    amountCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    amountLabel: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#333',
    },
    editAmountInput: {
        fontSize: 32,
        fontWeight: '800',
        color: '#333',
        borderBottomWidth: 2,
        borderBottomColor: '#53b175',
        minWidth: 150,
        paddingVertical: 2,
    },
    amountRight: {
        alignItems: 'flex-end',
    },
    amountCycle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#53b175',
        backgroundColor: '#53b17515',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 4,
    },
    amountUsd: {
        fontSize: 12,
        color: '#757575',
    },
    cycleSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    cycleOption: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cycleOptionActive: {
        backgroundColor: '#53b175',
        borderColor: '#53b175',
    },
    cycleOptionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#757575',
    },
    cycleOptionTextActive: {
        color: '#fff',
    },
    // Breakdown Card
    breakdownCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    breakdownTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    breakdownLabel: {
        fontSize: 14,
        color: '#757575',
    },
    breakdownValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
    },
    // Settings Card
    settingsCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    settingsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    settingDesc: {
        fontSize: 12,
        color: '#757575',
    },
    settingValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#757575',
    },
    editReminderInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 8,
        width: 50,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    // Toggle
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E0E0E0',
        padding: 2,
    },
    toggleActive: {
        backgroundColor: '#4CAF50',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    toggleThumbActive: {
        transform: [{ translateX: 22 }],
    },
    // Status Pill
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
    },
    pillActive: {
        backgroundColor: '#E8F5E9',
    },
    pillInactive: {
        backgroundColor: '#FFEBEE',
    },
    pillText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#757575',
    },
    pillTextActive: {
        color: '#4CAF50',
    },
    // History Card
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    emptyHistory: {
        alignItems: 'center',
        padding: 24,
    },
    emptyHistoryText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#757575',
        marginTop: 8,
    },
    emptyHistorySubtext: {
        fontSize: 13,
        color: '#AAA',
        marginTop: 4,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    paymentIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentDate: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    paymentMethod: {
        fontSize: 12,
        color: '#757575',
    },
    paymentRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    paymentAmount: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
    },
    // Cancel Button
    cancelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FFEBEE',
        padding: 16,
        borderRadius: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#E53935',
    },
    cancelBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#E53935',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 28,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
    },
    modalIconBg: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#FFEBEE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalDesc: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalActions: {
        width: '100%',
        gap: 10,
    },
    modalBtnSecondary: {
        padding: 14,
        borderRadius: 14,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
    },
    modalBtnSecondaryText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
    },
    modalBtnDanger: {
        padding: 14,
        borderRadius: 14,
        backgroundColor: '#E53935',
        alignItems: 'center',
    },
    modalBtnDangerText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
    // Receipt Modal
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
    receiptQrContainer: {
        alignItems: 'center',
        marginBottom: 24,
        padding: 24,
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
    },
    receiptQrLabel: {
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

export default SubscriptionDetails;
