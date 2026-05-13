import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Modal
} from 'react-native';
import { MyColours } from '../../Utils/MyColours';
import {
    generateCalendarEvents,
    getEventsForDate,
    getEventsForMonth,
    formatJamaicanDate,
    formatJMD,
    isOverdue,
    getBillerById
} from '../../Data/billers';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    DollarSign,
    X,
    Bell
} from 'lucide-react-native';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const EVENT_COLORS = {
    bill_due: '#E67E22',
    bill_paid: '#43A047',
    bill_issued: '#1E88E5',
    subscription_due: '#FDD835',
    subscription_paid: '#43A047',
    reminder: '#8E24AA'
};

const EVENT_ICONS = {
    bill_due: AlertCircle,
    bill_paid: CheckCircle2,
    bill_issued: Clock,
    subscription_due: RefreshCw,
    subscription_paid: CheckCircle2,
    reminder: Bell
};

const BillCalendar = ({ bills, subscriptions, onBillClick, onSubscriptionClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDayModal, setShowDayModal] = useState(false);
    const [filter, setFilter] = useState('all'); // all, bills, subscriptions, payments

    // Generate all calendar events
    const allEvents = useMemo(() => {
        return generateCalendarEvents(bills, subscriptions);
    }, [bills, subscriptions]);

    // Filtered events
    const filteredEvents = useMemo(() => {
        if (filter === 'all') return allEvents;
        if (filter === 'bills') return allEvents.filter(e => e.sourceType === 'bill');
        if (filter === 'subscriptions') return allEvents.filter(e => e.sourceType === 'subscription');
        if (filter === 'payments') return allEvents.filter(e => e.type.includes('paid'));
        return allEvents;
    }, [allEvents, filter]);

    // Calendar grid data
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const days = [];

        // Padding days from previous month
        for (let i = 0; i < startPadding; i++) {
            days.push({ type: 'padding', date: null });
        }

        // Actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = getEventsForDate(filteredEvents, dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            days.push({
                type: 'day',
                day,
                date: dateStr,
                events: dayEvents,
                isToday,
                isSelected: selectedDate === dateStr
            });
        }

        return days;
    }, [currentDate, filteredEvents, selectedDate]);

    // Month summary
    const monthEvents = useMemo(() => {
        return getEventsForMonth(filteredEvents, currentDate.getFullYear(), currentDate.getMonth());
    }, [filteredEvents, currentDate]);

    const monthStats = useMemo(() => {
        const due = monthEvents.filter(e => e.type === 'bill_due' || e.type === 'subscription_due');
        const paid = monthEvents.filter(e => e.type === 'bill_paid' || e.type === 'subscription_paid');
        const totalDue = due.reduce((sum, e) => {
            const amount = parseInt(e.subtitle?.replace(/[^0-9]/g, '')) || 0;
            return sum + amount;
        }, 0);

        return { dueCount: due.length, paidCount: paid.length, totalDue };
    }, [monthEvents]);

    const navigateMonth = useCallback((direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    }, []);

    const handleDayPress = useCallback((day) => {
        if (day.events.length > 0) {
            setSelectedDate(day.date);
            setShowDayModal(true);
        }
    }, []);

    const handleEventPress = useCallback((event) => {
        setShowDayModal(false);
        if (event.sourceType === 'bill' && onBillClick) {
            const bill = bills.find(b => b.id === event.sourceId);
            if (bill) onBillClick(bill);
        } else if (event.sourceType === 'subscription' && onSubscriptionClick) {
            const sub = subscriptions.find(s => s.id === event.sourceId);
            if (sub) onSubscriptionClick(sub);
        }
    }, [bills, subscriptions, onBillClick, onSubscriptionClick]);

    const renderDayCell = ({ item: day }) => {
        if (day.type === 'padding') {
            return <View style={styles.dayCell} />;
        }

        const hasEvents = day.events.length > 0;
        const eventColors = [...new Set(day.events.map(e => EVENT_COLORS[e.type] || EVENT_COLORS.reminder))];

        return (
            <TouchableOpacity
                style={[
                    styles.dayCell,
                    day.isToday && styles.dayCellToday,
                    day.isSelected && styles.dayCellSelected,
                    hasEvents && styles.dayCellHasEvents
                ]}
                onPress={() => handleDayPress(day)}
                activeOpacity={hasEvents ? 0.7 : 1}
            >
                <Text style={[
                    styles.dayNumber,
                    day.isToday && styles.dayNumberToday,
                    day.isSelected && styles.dayNumberSelected
                ]}>
                    {day.day}
                </Text>

                {hasEvents && (
                    <View style={styles.eventDots}>
                        {eventColors.slice(0, 3).map((color, idx) => (
                            <View key={idx} style={[styles.eventDot, { backgroundColor: color }]} />
                        ))}
                        {eventColors.length > 3 && (
                            <Text style={styles.eventDotMore}>+</Text>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderEventItem = ({ item: event }) => {
        const IconComponent = EVENT_ICONS[event.type] || Bell;

        return (
            <TouchableOpacity
                style={styles.eventItem}
                onPress={() => handleEventPress(event)}
            >
                <View style={[styles.eventIconBg, { backgroundColor: event.color + '15' }]}>
                    <IconComponent size={20} color={event.color} />
                </View>
                <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
                    <Text style={styles.eventDescription}>{event.description}</Text>
                </View>
                <ChevronRight size={18} color="#757575" />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Calendar Header */}
            <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
                    <ChevronLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>
                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Text>
                <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
                    <ChevronRight size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Month Stats */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <AlertCircle size={14} color="#E67E22" />
                    <Text style={styles.statText}>{monthStats.dueCount} due</Text>
                </View>
                <View style={styles.statItem}>
                    <CheckCircle2 size={14} color="#43A047" />
                    <Text style={styles.statText}>{monthStats.paidCount} paid</Text>
                </View>
                <View style={styles.statItem}>
                    <DollarSign size={14} color="#333" />
                    <Text style={styles.statText}>{formatJMD(monthStats.totalDue)} due</Text>
                </View>
            </View>

            {/* Filter Bar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
                {[
                    { id: 'all', label: 'All', icon: CalendarIcon },
                    { id: 'bills', label: 'Bills', icon: Clock },
                    { id: 'subscriptions', label: 'Subs', icon: RefreshCw },
                    { id: 'payments', label: 'Payments', icon: CheckCircle2 }
                ].map(f => (
                    <TouchableOpacity
                        key={f.id}
                        style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
                        onPress={() => setFilter(f.id)}
                    >
                        <f.icon size={14} color={filter === f.id ? '#fff' : "#757575"} />
                        <Text style={[styles.filterChipText, filter === f.id && styles.filterChipTextActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Week Day Headers */}
            <View style={styles.weekDaysRow}>
                {WEEK_DAYS.map(day => (
                    <Text key={day} style={styles.weekDayText}>{day}</Text>
                ))}
            </View>

            {/* Calendar Grid */}
            <FlatList
                data={calendarDays}
                renderItem={renderDayCell}
                keyExtractor={(item, index) => index.toString()}
                numColumns={7}
                scrollEnabled={false}
                contentContainerStyle={styles.calendarGrid}
            />

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: EVENT_COLORS.bill_due }]} />
                    <Text style={styles.legendText}>Bill Due</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: EVENT_COLORS.bill_paid }]} />
                    <Text style={styles.legendText}>Paid</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: EVENT_COLORS.subscription_due }]} />
                    <Text style={styles.legendText}>Sub Renews</Text>
                </View>
            </View>

            {/* Day Events Modal */}
            <Modal
                visible={showDayModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowDayModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectedDate ? formatJamaicanDate(selectedDate) : ''}
                            </Text>
                            <TouchableOpacity onPress={() => setShowDayModal(false)}>
                                <X size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={selectedDate ? getEventsForDate(filteredEvents, selectedDate) : []}
                            renderItem={renderEventItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.modalList}
                            ListEmptyComponent={
                                <View style={styles.emptyDay}>
                                    <CalendarIcon size={48} color="#757575" />
                                    <Text style={styles.emptyDayText}>No events this day</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    navButton: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        marginBottom: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#757575',
    },
    filterBar: {
        marginBottom: 12,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#53b175',
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#757575',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    weekDaysRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#757575',
        paddingVertical: 4,
    },
    calendarGrid: {
        alignItems: 'center',
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    dayCellToday: {
        backgroundColor: '#53b17510',
        borderRadius: 12,
    },
    dayCellSelected: {
        backgroundColor: '#53b17520',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#53b175',
    },
    dayCellHasEvents: {
        // Slight elevation for days with events
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    dayNumberToday: {
        color: '#53b175',
        fontWeight: '800',
    },
    dayNumberSelected: {
        color: '#53b175',
    },
    eventDots: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 2,
        alignItems: 'center',
    },
    eventDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },
    eventDotMore: {
        fontSize: 8,
        color: '#757575',
        marginLeft: 1,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 11,
        color: '#757575',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    modalList: {
        padding: 16,
    },
    eventItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        marginBottom: 10,
    },
    eventIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    eventSubtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    eventDescription: {
        fontSize: 12,
        color: '#757575',
    },
    emptyDay: {
        alignItems: 'center',
        padding: 40,
    },
    emptyDayText: {
        marginTop: 12,
        fontSize: 15,
        color: '#757575',
    },
});

export default BillCalendar;
