import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    RefreshControl,
    Animated,
    Dimensions
} from 'react-native';
import { MyColours } from '../Utils/MyColours';
import {
    SAMPLE_BILLS,
    SAMPLE_SUBSCRIPTIONS,
    formatJMD,
    getDaysUntil,
    getUpcomingRenewals,
    getMonthlySubscriptionCost,
    generateCalendarEvents,
    getEventsForDate,
    SUBSCRIPTION_BILLING_CYCLES,
    getBillerById
} from '../Data/billers';
import BillCard from '../Components/BillsUi/BillCard';
import BillCalendar from '../Components/BillsUi/BillCalendar';
import {
    Plus,
    DollarSign,
    RefreshCw,
    List,
    Calendar as CalendarIcon,
    Bell,
    TrendingUp,
    Zap,
    ChevronRight,
    AlertTriangle,
    Clock,
    CheckCircle2,
    BellRing
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const BillPayDashboard = () => {
    const navigation = useNavigation();
    const [bills, setBills] = useState(SAMPLE_BILLS);
    const [subscriptions, setSubscriptions] = useState(SAMPLE_SUBSCRIPTIONS);
    const [debts, setDebts] = useState([]); // Integrated debts
    const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'subscriptions'
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(3);
    const [showNotificationPanel, setShowNotificationPanel] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Animation values
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

    // Load data from storage on mount
    useEffect(() => {
        loadData();
    }, []);

    // Reload when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const storedBills = await AsyncStorage.getItem('userBills');
            const storedSubs = await AsyncStorage.getItem('userSubscriptions');
            if (storedBills) setBills(JSON.parse(storedBills));
            if (storedSubs) setSubscriptions(JSON.parse(storedSubs));
        } catch (err) {
            console.log('Using sample data');
        }
    };

    // Computed data
    const upcomingBills = useMemo(() =>
        bills.filter(b => b.status === 'unpaid').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
        [bills]
    );

    const paidBills = useMemo(() =>
        bills.filter(b => b.status === 'paid').sort((a, b) => new Date(b.paidDate || b.payments?.[0]?.date) - new Date(a.paidDate || a.payments?.[0]?.date)),
        [bills]
    );

    const overdueBills = useMemo(() =>
        bills.filter(b => b.status === 'unpaid' && getDaysUntil(b.dueDate) < 0),
        [bills]
    );

    const upcomingRenewals = useMemo(() =>
        getUpcomingRenewals(subscriptions, 14),
        [subscriptions]
    );

    const activeSubscriptions = useMemo(() =>
        subscriptions.filter(s => s.status === 'active'),
        [subscriptions]
    );

    // Combined financial summary
    const totalBillsDue = useMemo(() =>
        upcomingBills.reduce((sum, b) => sum + (b.amountDue || b.amount), 0),
        [upcomingBills]
    );

    const totalSubsDue = useMemo(() =>
        upcomingRenewals.reduce((sum, s) => sum + s.amount, 0),
        [upcomingRenewals]
    );

    const totalDebtsDue = useMemo(() =>
        debts.reduce((sum, d) => sum + (parseFloat(d.currentPayment || d.minPayment) || 0), 0),
        [debts]
    );

    const totalMonthlyObligations = useMemo(() =>
        totalBillsDue + totalSubsDue + totalDebtsDue,
        [totalBillsDue, totalSubsDue, totalDebtsDue]
    );

    const monthlySubCost = useMemo(() =>
        getMonthlySubscriptionCost(subscriptions),
        [subscriptions]
    );

    // Calendar events - unified with debts
    const calendarEvents = useMemo(() =>
        generateCalendarEvents(bills, subscriptions, debts),
        [bills, subscriptions, debts]
    );

    const todayEvents = useMemo(() =>
        getEventsForDate(calendarEvents, selectedDate),
        [calendarEvents, selectedDate]
    );

    // Notifications
    const notifications = useMemo(() => {
        const notifs = [];

        // Overdue bills
        overdueBills.forEach(bill => {
            const days = Math.abs(getDaysUntil(bill.dueDate));
            notifs.push({
                id: `overdue_${bill.id}`,
                type: 'urgent',
                title: `${getBillerById(bill.billerId)?.shortName || 'Bill'} Overdue`,
                message: `${days} days overdue — ${formatJMD(bill.amountDue || bill.amount)}`,
                date: bill.dueDate,
                action: 'PayBill',
                params: { bill },
                read: false,
                icon: 'alert'
            });
        });

        // Bills due soon
        upcomingBills.filter(b => getDaysUntil(b.dueDate) > 0 && getDaysUntil(b.dueDate) <= 3).forEach(bill => {
            const days = getDaysUntil(bill.dueDate);
            notifs.push({
                id: `due_${bill.id}`,
                type: 'warning',
                title: `${getBillerById(bill.billerId)?.shortName || 'Bill'} Due ${days === 0 ? 'Today' : 'Soon'}`,
                message: `${formatJMD(bill.amountDue || bill.amount)} — ${days === 0 ? 'Due today' : `Due in ${days} days`}`,
                date: bill.dueDate,
                action: 'PayBill',
                params: { bill },
                read: false,
                icon: 'clock'
            });
        });

        // Subscription renewals
        upcomingRenewals.forEach(sub => {
            const days = getDaysUntil(sub.nextBillingDate);
            notifs.push({
                id: `renewal_${sub.id}`,
                type: 'info',
                title: `${sub.name} Renews ${days <= 1 ? 'Tomorrow' : `in ${days} days`}`,
                message: `${formatJMD(sub.amount)} — ${SUBSCRIPTION_BILLING_CYCLES[sub.billingCycle]?.label}`,
                date: sub.nextBillingDate,
                action: 'SubscriptionDetails',
                params: { subscription: sub },
                read: false,
                icon: 'refresh'
            });
        });

        return notifs.sort((a, b) => {
            const priority = { urgent: 0, warning: 1, info: 2 };
            return priority[a.type] - priority[b.type];
        });
    }, [overdueBills, upcomingBills, upcomingRenewals]);

    const unreadCount = useMemo(() =>
        notifications.filter(n => !n.read).length,
        [notifications]
    );

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        // Simulate API refresh
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1500);
    }, []);

    const handleBillClick = (bill) => {
        navigation.navigate('BillDetails', { bill });
    };

    const handleNotificationPress = (notif) => {
        // Mark as read
        setUnreadNotifications(prev => Math.max(0, prev - 1));
        setShowNotificationPanel(false);

        // Navigate
        if (notif.action && notif.params) {
            navigation.navigate(notif.action, notif.params);
        }
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    const handleEventPress = (event) => {
         if (event.sourceType === 'bill') {
            const bill = bills.find(b => b.id === event.sourceId);
            if (bill) handleBillClick(bill);
        } else if (event.sourceType === 'subscription') {
            const sub = subscriptions.find(s => s.id === event.sourceId);
            if (sub) navigation.navigate('SubscriptionDetails', { subscription: sub });
        }
    };

    // Render notification badge
    const NotificationBadge = () => (
        <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => setShowNotificationPanel(!showNotificationPanel)}
        >
            <Bell size={22} color="#fff" />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={MyColours.primary} />

            {/* Sticky Header */}
            <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
                <Text style={styles.stickyTitle}>My Bills</Text>
                <NotificationBadge />
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Hero Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerGreeting}>Good morning,</Text>
                            <Text style={styles.headerTitle}>My Bills</Text>
                        </View>
                        <NotificationBadge />
                    </View>
                    <Text style={styles.headerSubtitle}>Manage all your Jamaican bills & subscriptions</Text>
                </View>

                {/* Combined Summary Cards */}
                <View style={styles.summaryContainer}>
                    {/* Main Total Card */}
                    <View style={styles.totalCard}>
                        <View style={styles.totalHeader}>
                            <View style={styles.totalIconBg}>
                                <DollarSign size={20} color={MyColours.primary} />
                            </View>
                            <View>
                                <Text style={styles.totalLabel}>Due This Month</Text>
                                <Text style={styles.totalAmount}>{formatJMD(totalMonthlyObligations)}</Text>
                            </View>
                        </View>

                        <View style={styles.totalBreakdown}>
                            <View style={styles.breakdownItem}>
                                <Zap size={14} color="#E67E22" />
                                <Text style={styles.breakdownText}>
                                    {upcomingBills.length} bills ({formatJMD(totalBillsDue)})
                                </Text>
                            </View>
                            <View style={styles.breakdownItem}>
                                <RefreshCw size={14} color="#1E88E5" />
                                <Text style={styles.breakdownText}>
                                    {upcomingRenewals.length} subscriptions ({formatJMD(totalSubsDue)})
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Stats Row */}
                    <View style={styles.quickStatsRow}>
                        <TouchableOpacity
                            style={[styles.quickStatCard, overdueBills.length > 0 && styles.quickStatUrgent]}
                            onPress={() => setViewMode('list')}
                        >
                            <AlertTriangle size={20} color={overdueBills.length > 0 ? '#E53935' : "#757575"} />
                            <Text style={[styles.quickStatNumber, overdueBills.length > 0 && styles.textUrgent]}>
                                {overdueBills.length}
                            </Text>
                            <Text style={styles.quickStatLabel}>Overdue</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickStatCard}
                            onPress={() => navigation.navigate('BudgetPlanner')}
                        >
                            <TrendingUp size={20} color="#4CAF50" />
                            <Text style={styles.quickStatNumber}>{formatJMD(monthlySubCost)}</Text>
                            <Text style={styles.quickStatLabel}>Monthly Subs</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickStatCard}
                            onPress={() => navigation.navigate('PaymentHistory', { bills, subscriptions })}
                        >
                            <CheckCircle2 size={20} color="#2196F3" />
                            <Text style={styles.quickStatNumber}>{paidBills.length}</Text>
                            <Text style={styles.quickStatLabel}>Paid</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Notification Panel */}
                {showNotificationPanel && notifications.length > 0 && (
                    <View style={styles.notificationPanel}>
                        <View style={styles.notificationPanelHeader}>
                            <Text style={styles.notificationPanelTitle}>Notifications</Text>
                            <TouchableOpacity onPress={() => setShowNotificationPanel(false)}>
                                <Text style={styles.notificationPanelClose}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        {notifications.slice(0, 5).map(notif => (
                            <TouchableOpacity
                                key={notif.id}
                                style={[
                                    styles.notificationItem,
                                    notif.type === 'urgent' && styles.notificationUrgent,
                                    notif.type === 'warning' && styles.notificationWarning
                                ]}
                                onPress={() => handleNotificationPress(notif)}
                            >
                                <View style={styles.notificationIconBg}>
                                    {notif.icon === 'alert' && <AlertTriangle size={16} color="#E53935" />}
                                    {notif.icon === 'clock' && <Clock size={16} color="#E67E22" />}
                                    {notif.icon === 'refresh' && <RefreshCw size={16} color="#1E88E5" />}
                                </View>
                                <View style={styles.notificationContent}>
                                    <Text style={styles.notificationTitle}>{notif.title}</Text>
                                    <Text style={styles.notificationMessage}>{notif.message}</Text>
                                </View>
                                <ChevronRight size={16} color="#757575" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* View Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
                        onPress={() => setViewMode('list')}
                    >
                        <List size={16} color={viewMode === 'list' ? '#fff' : "#757575"} />
                        <Text style={[styles.toggleText, viewMode === 'list' && styles.activeToggleText]}>Bills</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === 'calendar' && styles.activeToggle]}
                        onPress={() => setViewMode('calendar')}
                    >
                        <CalendarIcon size={16} color={viewMode === 'calendar' ? '#fff' : "#757575"} />
                        <Text style={[styles.toggleText, viewMode === 'calendar' && styles.activeToggleText]}>Calendar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === 'subscriptions' && styles.activeToggle]}
                        onPress={() => setViewMode('subscriptions')}
                    >
                        <RefreshCw size={16} color={viewMode === 'subscriptions' ? '#fff' : "#757575"} />
                        <Text style={[styles.toggleText, viewMode === 'subscriptions' && styles.activeToggleText]}>Subs</Text>
                    </TouchableOpacity>
                </View>

                {/* Content Based on View Mode */}
                {viewMode === 'calendar' ? (
                    <View style={styles.calendarContainer}>
                        <BillCalendar
                            bills={bills}
                            subscriptions={subscriptions}
                            debts={debts}
                            onBillClick={handleBillClick}
                            onSubscriptionClick={(sub) => navigation.navigate('SubscriptionDetails', { subscription: sub })}
                        />

                        {/* Today's Events */}
                        {todayEvents.length > 0 && (
                            <View style={styles.todayEvents}>
                                <Text style={styles.sectionTitle}>Today</Text>
                                {todayEvents.map(event => (
                                    <TouchableOpacity
                                        key={event.id}
                                        style={[styles.todayEventCard, { borderLeftColor: event.color, borderLeftWidth: 4 }]}
                                        onPress={() => handleEventPress(event)}
                                    >
                                        <View style={styles.todayEventInfo}>
                                            <Text style={styles.todayEventTitle}>{event.title}</Text>
                                            <Text style={styles.todayEventSubtitle}>{event.subtitle}</Text>
                                        </View>
                                        <ChevronRight size={18} color="#757575" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                ) : viewMode === 'subscriptions' ? (
                    <View style={styles.subscriptionsPreview}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Active Subscriptions</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SubscriptionTracker')}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        {activeSubscriptions.length === 0 ? (
                            <View style={styles.emptyState}>
                                <RefreshCw size={40} color="#757575" />
                                <Text style={styles.emptyStateText}>No subscriptions yet</Text>
                                <TouchableOpacity
                                    style={styles.emptyStateBtn}
                                    onPress={() => navigation.navigate('SubscriptionTracker')}
                                >
                                    <Text style={styles.emptyStateBtnText}>Add Subscription</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                {activeSubscriptions.slice(0, 3).map(sub => {
                                    const days = getDaysUntil(sub.nextBillingDate);
                                    return (
                                        <TouchableOpacity
                                            key={sub.id}
                                            style={styles.subPreviewCard}
                                            onPress={() => navigation.navigate('SubscriptionDetails', { subscription: sub })}
                                        >
                                            <View style={[styles.subPreviewIcon, { backgroundColor: sub.brandColor + '15' }]}>
                                                <Text style={{ fontSize: 20 }}>{sub.icon}</Text>
                                            </View>
                                            <View style={styles.subPreviewInfo}>
                                                <Text style={styles.subPreviewName}>{sub.name}</Text>
                                                <Text style={styles.subPreviewAmount}>{formatJMD(sub.amount)}/mo</Text>
                                            </View>
                                            <View style={styles.subPreviewRenewal}>
                                                <Text style={[
                                                    styles.subPreviewDays,
                                                    days <= 3 && styles.subPreviewUrgent
                                                ]}>
                                                    {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
                                                </Text>
                                                <ChevronRight size={16} color="#757575" />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}

                                {upcomingRenewals.length > 0 && (
                                    <View style={styles.renewalAlert}>
                                        <BellRing size={16} color="#E67E22" />
                                        <Text style={styles.renewalAlertText}>
                                            {upcomingRenewals.length} subscription{upcomingRenewals.length > 1 ? 's' : ''} renew{upcomingRenewals.length === 1 ? 's' : ''} this week
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {/* Overdue Alert */}
                        {overdueBills.length > 0 && (
                            <View style={styles.overdueAlert}>
                                <AlertTriangle size={20} color="#E53935" />
                                <View style={styles.overdueAlertContent}>
                                    <Text style={styles.overdueAlertTitle}>
                                        {overdueBills.length} Bill{overdueBills.length > 1 ? 's' : ''} Overdue
                                    </Text>
                                    <Text style={styles.overdueAlertAmount}>
                                        Total: {formatJMD(overdueBills.reduce((s, b) => s + (b.amountDue || b.amount), 0))}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.overdueAlertBtn}
                                    onPress={() => navigation.navigate('PayBill', { bill: overdueBills[0] })}
                                >
                                    <Text style={styles.overdueAlertBtnText}>Pay Now</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Upcoming Bills */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Upcoming Bills</Text>
                                <Text style={styles.sectionCount}>{upcomingBills.length}</Text>
                            </View>
                            {upcomingBills.length === 0 ? (
                                <View style={styles.emptyStateSmall}>
                                    <CheckCircle2 size={32} color="#4CAF50" />
                                    <Text style={styles.emptyStateSmallText}>All caught up!</Text>
                                </View>
                            ) : (
                                upcomingBills.map(bill => (
                                    <BillCard
                                        key={bill.id}
                                        bill={bill}
                                        onPress={() => handleBillClick(bill)}
                                    />
                                ))
                            )}
                        </View>

                        {/* Recently Paid */}
                        {paidBills.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Recently Paid</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('PaymentHistory', { bills, subscriptions })}>
                                        <Text style={styles.seeAllText}>History</Text>
                                    </TouchableOpacity>
                                </View>
                                {paidBills.slice(0, 3).map(bill => (
                                    <BillCard
                                        key={bill.id}
                                        bill={bill}
                                        onPress={() => handleBillClick(bill)}
                                        isPaid
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <View style={styles.fabContainer}>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('AddBiller')}
                    activeOpacity={0.8}
                >
                    <Plus size={28} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#53b175',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        zIndex: 100,
    },
    stickyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 100,
    },
    header: {
        backgroundColor: '#53b175',
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    headerGreeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    notificationBtn: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#E53935',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#53b175',
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    summaryContainer: {
        paddingHorizontal: 24,
        marginTop: -24,
        marginBottom: 20,
    },
    totalCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
        marginBottom: 12,
    },
    totalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalIconBg: {
        backgroundColor: '#E8F5E9',
        padding: 10,
        borderRadius: 14,
        marginRight: 12,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#757575',
    },
    totalAmount: {
        fontSize: 36,
        fontWeight: '800',
        color: '#333',
        marginTop: 2,
    },
    totalBreakdown: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    breakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    breakdownText: {
        fontSize: 13,
        color: '#757575',
    },
    quickStatsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    quickStatCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    quickStatUrgent: {
        borderColor: '#E53935',
        backgroundColor: '#FFEBEE',
    },
    quickStatNumber: {
        fontSize: 18,
        fontWeight: '800',
        color: '#333',
        marginVertical: 6,
    },
    textUrgent: {
        color: '#E53935',
    },
    quickStatLabel: {
        fontSize: 11,
        color: '#757575',
    },
    notificationPanel: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 24,
        marginBottom: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    notificationPanelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    notificationPanelTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    notificationPanelClose: {
        fontSize: 14,
        color: '#53b175',
        fontWeight: '600',
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#F8F9FA',
    },
    notificationUrgent: {
        backgroundColor: '#FFEBEE',
        borderLeftWidth: 3,
        borderLeftColor: '#E53935',
    },
    notificationWarning: {
        backgroundColor: '#FFF3E0',
        borderLeftWidth: 3,
        borderLeftColor: '#E67E22',
    },
    notificationIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    notificationMessage: {
        fontSize: 12,
        color: '#757575',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 24,
        padding: 4,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    activeToggle: {
        backgroundColor: '#53b175',
        shadowColor: '#53b175',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#757575',
    },
    activeToggleText: {
        color: '#fff',
    },
    calendarContainer: {
        paddingHorizontal: 24,
    },
    todayEvents: {
        marginTop: 16,
    },
    todayEventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    todayEventInfo: {
        flex: 1,
    },
    todayEventTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    todayEventSubtitle: {
        fontSize: 13,
        color: '#757575',
    },
    subscriptionsPreview: {
        paddingHorizontal: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    sectionCount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#53b175',
        backgroundColor: '#53b17515',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#53b175',
    },
    subPreviewCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    subPreviewIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    subPreviewInfo: {
        flex: 1,
    },
    subPreviewName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    subPreviewAmount: {
        fontSize: 13,
        color: '#757575',
    },
    subPreviewRenewal: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    subPreviewDays: {
        fontSize: 13,
        fontWeight: '600',
        color: '#757575',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    subPreviewUrgent: {
        color: '#E53935',
        backgroundColor: '#FFEBEE',
    },
    renewalAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    renewalAlertText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#E67E22',
    },
    listContainer: {
        paddingHorizontal: 24,
    },
    overdueAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E53935',
    },
    overdueAlertContent: {
        flex: 1,
        marginLeft: 12,
    },
    overdueAlertTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#E53935',
        marginBottom: 2,
    },
    overdueAlertAmount: {
        fontSize: 13,
        color: '#E53935',
    },
    overdueAlertBtn: {
        backgroundColor: '#E53935',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    overdueAlertBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    section: {
        marginBottom: 24,
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    emptyStateSmall: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#757575',
        marginTop: 12,
        marginBottom: 16,
    },
    emptyStateSmallText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
        marginTop: 8,
    },
    emptyStateBtn: {
        backgroundColor: '#53b175',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    emptyStateBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#53b175',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#53b175',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
});

export default BillPayDashboard;
