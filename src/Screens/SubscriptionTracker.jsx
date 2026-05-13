import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    Modal,
    Alert,
    FlatList
} from 'react-native';
import { MyColours } from '../Utils/MyColours';
import {
    SUBSCRIPTION_PRESETS,
    SUBSCRIPTION_CATEGORIES,
    SUBSCRIPTION_BILLING_CYCLES,
    formatJMD,
    getMonthlySubscriptionCost,
    getAnnualSubscriptionCost,
    getSubscriptionCategoryBreakdown,
    getUpcomingRenewals,
    getDaysUntil,
    getUrgencyLevel
} from '../Data/billers';
import {
    ArrowLeft,
    Plus,
    Search,
    X,
    ChevronRight,
    Calendar,
    RefreshCw,
    BellOff,
    Trash2,
    TrendingUp,
    DollarSign,
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
    CheckCircle2,
    AlertTriangle,
    Clock,
    Gamepad,
    Package,
    Film,
    Apple,
    PenTool,
    Layout,
    Bike,
    Activity
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

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

const SubscriptionTracker = () => {
    const navigation = useNavigation();
    const [subscriptions, setSubscriptions] = useState([]); // Load from storage
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [customAmount, setCustomAmount] = useState('');
    const [customCycle, setCustomCycle] = useState('monthly');
    const [customName, setCustomName] = useState('');
    const [isCustom, setIsCustom] = useState(false);

    // Computed values
    const monthlyCost = useMemo(() => getMonthlySubscriptionCost(subscriptions), [subscriptions]);
    const annualCost = useMemo(() => getAnnualSubscriptionCost(subscriptions), [subscriptions]);
    const categoryBreakdown = useMemo(() => getSubscriptionCategoryBreakdown(subscriptions), [subscriptions]);
    const upcomingRenewals = useMemo(() => getUpcomingRenewals(subscriptions, 14), [subscriptions]);
    const activeSubs = useMemo(() => subscriptions.filter(s => s.status === 'active'), [subscriptions]);

    const filteredPresets = useMemo(() => {
        if (!searchQuery) return SUBSCRIPTION_PRESETS;
        return SUBSCRIPTION_PRESETS.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const filteredByCategory = useMemo(() => {
        if (!selectedCategory) return filteredPresets;
        return filteredPresets.filter(p => p.category === selectedCategory);
    }, [filteredPresets, selectedCategory]);

    const handleAddSubscription = () => {
        if (isCustom && (!customName || !customAmount)) {
            Alert.alert('Missing Information', 'Please enter a name and amount.');
            return;
        }

        const newSub = {
            id: `sub_${Date.now()}`,
            name: isCustom ? customName : selectedPreset.name,
            category: isCustom ? 'other' : selectedPreset.category,
            icon: isCustom ? 'more-horizontal' : selectedPreset.icon,
            brandColor: isCustom ? (MyColours.primary || '#53b175') : selectedPreset.brandColor,
            amount: parseFloat(isCustom ? customAmount : selectedPreset.defaultAmount),
            currency: 'JMD',
            originalCurrency: isCustom ? null : selectedPreset.originalCurrency,
            originalAmount: isCustom ? null : selectedPreset.originalAmount,
            exchangeRate: isCustom ? null : selectedPreset.exchangeRate,
            billingCycle: customCycle,
            nextBillingDate: calculateNextBillingDate(customCycle),
            status: 'active',
            autoRenew: true,
            reminderDays: 3,
            reminderChannel: 'push',
            paymentMethod: { type: 'card', last4: '4242' },
            paymentHistory: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setSubscriptions([...subscriptions, newSub]);
        setShowAddModal(false);
        resetForm();
    };

    const calculateNextBillingDate = (cycle) => {
        const now = new Date();
        const cycleInfo = SUBSCRIPTION_BILLING_CYCLES[cycle];
        const nextDate = new Date(now.getTime() + cycleInfo.days * 24 * 60 * 60 * 1000);
        return nextDate.toISOString().split('T')[0];
    };

    const resetForm = () => {
        setSelectedPreset(null);
        setCustomAmount('');
        setCustomCycle('monthly');
        setCustomName('');
        setIsCustom(false);
        setSelectedCategory(null);
        setSearchQuery('');
    };

    const handleToggleAutoRenew = (subId) => {
        setSubscriptions(subs => subs.map(sub =>
            sub.id === subId ? { ...sub, autoRenew: !sub.autoRenew } : sub
        ));
    };

    const handleCancelSubscription = (subId) => {
        Alert.alert(
            'Cancel Subscription',
            'Are you sure? This will mark the subscription as cancelled.',
            [
                { text: 'Keep', style: 'cancel' },
                {
                    text: 'Cancel Subscription',
                    style: 'destructive',
                    onPress: () => setSubscriptions(subs => subs.map(sub =>
                        sub.id === subId ? { ...sub, status: 'cancelled', autoRenew: false } : sub
                    ))
                }
            ]
        );
    };

    const handleDeleteSubscription = (subId) => {
        Alert.alert(
            'Delete Subscription',
            'This will permanently remove this subscription from tracking.',
            [
                { text: 'Keep', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => setSubscriptions(subs => subs.filter(sub => sub.id !== subId))
                }
            ]
        );
    };

    const renderSubscriptionCard = ({ item: sub }) => {
        const daysUntil = getDaysUntil(sub.nextBillingDate);
        const urgency = getUrgencyLevel(sub.nextBillingDate);
        const IconComponent = ICON_MAP[sub.icon] || MoreHorizontal;

        return (
            <TouchableOpacity
                style={[styles.subCard, sub.status === 'cancelled' && styles.subCardCancelled]}
                onPress={() => navigation.navigate('SubscriptionDetails', { subscription: sub })}
            >
                <View style={styles.subCardHeader}>
                    <View style={[styles.subIconBg, { backgroundColor: sub.brandColor + '15' }]}>
                        <IconComponent size={24} color={sub.brandColor} />
                    </View>
                    <View style={styles.subInfo}>
                        <Text style={styles.subName}>{sub.name}</Text>
                        <Text style={styles.subCategory}>
                            {SUBSCRIPTION_CATEGORIES.find(c => c.id === sub.category)?.name || sub.category}
                        </Text>
                    </View>
                    <View style={styles.subAmount}>
                        <Text style={styles.subAmountText}>{formatJMD(sub.amount)}</Text>
                        <Text style={styles.subCycle}>
                            {SUBSCRIPTION_BILLING_CYCLES[sub.billingCycle]?.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.subCardFooter}>
                    <View style={styles.subRenewalInfo}>
                        {urgency === 'overdue' ? (
                            <AlertTriangle size={14} color="#E53935" />
                        ) : urgency === 'urgent' ? (
                            <Clock size={14} color="#E67E22" />
                        ) : (
                            <Calendar size={14} color="#757575" />
                        )}
                        <Text style={[
                            styles.subRenewalText,
                            urgency === 'overdue' && styles.textOverdue,
                            urgency === 'urgent' && styles.textUrgent
                        ]}>
                            {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
                             daysUntil === 0 ? 'Renews today' :
                             daysUntil === 1 ? 'Renews tomorrow' :
                             `Renews in ${daysUntil} days`}
                        </Text>
                    </View>

                    {sub.status === 'active' && (
                        <View style={styles.subActions}>
                            <TouchableOpacity
                                onPress={() => handleToggleAutoRenew(sub.id)}
                                style={[styles.actionBtn, sub.autoRenew && styles.actionBtnActive]}
                            >
                                <RefreshCw size={16} color={sub.autoRenew ? '#4CAF50' : "#757575"} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleCancelSubscription(sub.id)}
                                style={styles.actionBtn}
                            >
                                <BellOff size={16} color="#757575" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleDeleteSubscription(sub.id)}
                                style={styles.actionBtn}
                            >
                                <Trash2 size={16} color="#E53935" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscriptions</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
                    <Plus size={24} color="#53b175" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryIconBg}>
                            <DollarSign size={20} color="#53b175" />
                        </View>
                        <Text style={styles.summaryLabel}>Monthly</Text>
                        <Text style={styles.summaryAmount}>{formatJMD(monthlyCost)}</Text>
                        <Text style={styles.summarySubtext}>{activeSubs.length} active</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <View style={[styles.summaryIconBg, { backgroundColor: '#E8F5E9' }]}>
                            <TrendingUp size={20} color="#4CAF50" />
                        </View>
                        <Text style={styles.summaryLabel}>Annual</Text>
                        <Text style={styles.summaryAmount}>{formatJMD(annualCost)}</Text>
                        <Text style={styles.summarySubtext}>Projected spend</Text>
                    </View>
                </View>

                {/* Upcoming Renewals */}
                {upcomingRenewals.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Upcoming Renewals</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.renewalScroll}>
                            {upcomingRenewals.map(sub => {
                                const days = getDaysUntil(sub.nextBillingDate);
                                const IconComponent = ICON_MAP[sub.icon] || MoreHorizontal;
                                return (
                                    <View key={sub.id} style={styles.renewalCard}>
                                        <View style={[styles.renewalIconBg, { backgroundColor: sub.brandColor + '15' }]}>
                                            <IconComponent size={20} color={sub.brandColor} />
                                        </View>
                                        <Text style={styles.renewalName} numberOfLines={1}>{sub.name}</Text>
                                        <Text style={styles.renewalAmount}>{formatJMD(sub.amount)}</Text>
                                        <View style={styles.renewalBadge}>
                                            <Text style={styles.renewalBadgeText}>
                                                {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Category Breakdown */}
                {Object.keys(categoryBreakdown).length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Spending by Category</Text>
                        <View style={styles.categoryList}>
                            {Object.entries(categoryBreakdown).map(([catId, data]) => {
                                const cat = SUBSCRIPTION_CATEGORIES.find(c => c.id === catId);
                                const percentage = (data.monthly / monthlyCost) * 100;
                                return (
                                    <View key={catId} style={styles.categoryRow}>
                                        <View style={styles.categoryRowLeft}>
                                            <View style={[styles.categoryDot, { backgroundColor: cat?.color || '#53b175' }]} />
                                            <Text style={styles.categoryName}>{cat?.name || catId}</Text>
                                        </View>
                                        <View style={styles.categoryRowRight}>
                                            <Text style={styles.categoryAmount}>{formatJMD(data.monthly)}/mo</Text>
                                            <View style={styles.categoryBar}>
                                                <View style={[styles.categoryBarFill, { width: `${percentage}%`, backgroundColor: cat?.color || '#53b175' }]} />
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Active Subscriptions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Active Subscriptions</Text>
                    {activeSubs.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No subscriptions yet</Text>
                            <Text style={styles.emptyStateSubtext}>Tap + to add your first subscription</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={activeSubs}
                            renderItem={renderSubscriptionCard}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                        />
                    )}
                </View>

                {/* Cancelled Subscriptions */}
                {subscriptions.filter(s => s.status === 'cancelled').length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cancelled</Text>
                        <FlatList
                            data={subscriptions.filter(s => s.status === 'cancelled')}
                            renderItem={renderSubscriptionCard}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                        />
                    </View>
                )}
            </ScrollView>

            {/* Add Subscription Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => { setShowAddModal(false); resetForm(); }}>
                            <X size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Add Subscription</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Search */}
                        <View style={styles.searchBar}>
                            <Search size={20} color="#757575" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search Netflix, Spotify, etc."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#757575"
                            />
                        </View>

                        {/* Category Filter */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
                            <TouchableOpacity
                                style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                                onPress={() => setSelectedCategory(null)}
                            >
                                <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>All</Text>
                            </TouchableOpacity>
                            {SUBSCRIPTION_CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
                                    onPress={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                                >
                                    <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Presets Grid */}
                        {!isCustom && (
                            <View style={styles.presetsGrid}>
                                {filteredByCategory.map(preset => {
                                    const IconComponent = ICON_MAP[preset.icon] || MoreHorizontal;
                                    return (
                                        <TouchableOpacity
                                            key={preset.id}
                                            style={[styles.presetCard, selectedPreset?.id === preset.id && styles.presetCardSelected]}
                                            onPress={() => setSelectedPreset(preset)}
                                        >
                                            <View style={[styles.presetIconBg, { backgroundColor: preset.brandColor + '15' }]}>
                                                <IconComponent size={28} color={preset.brandColor} />
                                            </View>
                                            <Text style={styles.presetName} numberOfLines={1}>{preset.name}</Text>
                                            <Text style={styles.presetAmount}>{formatJMD(preset.defaultAmount)}</Text>
                                            {preset.originalCurrency === 'USD' && (
                                                <Text style={styles.presetUsd}>≈ USD ${preset.originalAmount}</Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}

                        {/* Custom Toggle */}
                        <TouchableOpacity
                            style={styles.customToggle}
                            onPress={() => { setIsCustom(!isCustom); setSelectedPreset(null); }}
                        >
                            <Text style={styles.customToggleText}>
                                {isCustom ? '← Back to presets' : '+ Add custom subscription'}
                            </Text>
                        </TouchableOpacity>

                        {/* Custom Form */}
                        {isCustom && (
                            <View style={styles.customForm}>
                                <Text style={styles.inputLabel}>Subscription Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={customName}
                                    onChangeText={setCustomName}
                                    placeholder="e.g., Local Gym"
                                    placeholderTextColor="#757575"
                                />
                                <Text style={styles.inputLabel}>Amount (JMD)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={customAmount}
                                    onChangeText={setCustomAmount}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#757575"
                                />
                            </View>
                        )}

                        {/* Billing Cycle */}
                        <Text style={styles.inputLabel}>Billing Cycle</Text>
                        <View style={styles.cycleGrid}>
                            {Object.entries(SUBSCRIPTION_BILLING_CYCLES).map(([key, cycle]) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[styles.cycleBtn, customCycle === key && styles.cycleBtnActive]}
                                    onPress={() => setCustomCycle(key)}
                                >
                                    <Text style={[styles.cycleBtnText, customCycle === key && styles.cycleBtnTextActive]}>
                                        {cycle.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Add Button */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.addSubButton, (!selectedPreset && !isCustom) && styles.addSubButtonDisabled]}
                            onPress={handleAddSubscription}
                            disabled={!selectedPreset && !isCustom}
                        >
                            <Text style={styles.addSubButtonText}>
                                {isCustom ? 'Add Custom Subscription' : `Add ${selectedPreset?.name || 'Subscription'}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
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
    addButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    summaryContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    summaryIconBg: {
        backgroundColor: '#E8F5E9',
        padding: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 4,
    },
    summaryAmount: {
        fontSize: 24,
        fontWeight: '800',
        color: '#333',
        marginBottom: 4,
    },
    summarySubtext: {
        fontSize: 12,
        color: '#757575',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
    },
    renewalScroll: {
        marginHorizontal: -4,
    },
    renewalCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        width: 140,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    renewalIconBg: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    renewalName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    renewalAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    renewalBadge: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    renewalBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#E67E22',
    },
    categoryList: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    categoryRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    categoryName: {
        fontSize: 14,
        color: '#333',
    },
    categoryRowRight: {
        alignItems: 'flex-end',
    },
    categoryAmount: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    categoryBar: {
        width: 100,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
    },
    categoryBarFill: {
        height: 4,
        borderRadius: 2,
    },
    subCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    subCardCancelled: {
        opacity: 0.6,
    },
    subCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    subIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    subInfo: {
        flex: 1,
    },
    subName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    subCategory: {
        fontSize: 12,
        color: '#757575',
    },
    subAmount: {
        alignItems: 'flex-end',
    },
    subAmountText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    subCycle: {
        fontSize: 11,
        color: '#757575',
    },
    subCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    subRenewalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    subRenewalText: {
        fontSize: 13,
        color: '#757575',
    },
    textOverdue: {
        color: '#E53935',
        fontWeight: '600',
    },
    textUrgent: {
        color: '#E67E22',
        fontWeight: '600',
    },
    subActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
    },
    actionBtnActive: {
        backgroundColor: '#E8F5E9',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
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
        marginBottom: 4,
    },
    emptyStateSubtext: {
        fontSize: 13,
        color: '#757575',
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
    },
    categoryFilter: {
        marginBottom: 16,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    categoryChipActive: {
        backgroundColor: '#53b175',
        borderColor: '#53b175',
    },
    categoryChipText: {
        fontSize: 13,
        color: '#757575',
    },
    categoryChipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    presetsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    presetCard: {
        width: '47%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    presetCardSelected: {
        borderColor: '#53b175',
        borderWidth: 2,
    },
    presetIconBg: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    presetName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    presetAmount: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    presetUsd: {
        fontSize: 11,
        color: '#757575',
        marginTop: 2,
    },
    customToggle: {
        padding: 16,
        alignItems: 'center',
        marginVertical: 16,
    },
    customToggleText: {
        color: '#53b175',
        fontWeight: '600',
        fontSize: 15,
    },
    customForm: {
        gap: 12,
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cycleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    cycleBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cycleBtnActive: {
        backgroundColor: '#53b175',
        borderColor: '#53b175',
    },
    cycleBtnText: {
        fontSize: 13,
        color: '#757575',
    },
    cycleBtnTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: '#fff',
    },
    addSubButton: {
        backgroundColor: '#53b175',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    addSubButtonDisabled: {
        backgroundColor: '#DDD',
    },
    addSubButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default SubscriptionTracker;
