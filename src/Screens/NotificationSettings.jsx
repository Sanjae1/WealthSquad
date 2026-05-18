import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    TextInput,
    Alert,
    SafeAreaView
} from 'react-native';
import { MyColours } from '../Utils/MyColours';
import {
    ArrowLeft,
    Bell,
    BellRing,
    Moon,
    DollarSign,
    CheckCircle2,
    AlertTriangle,
    Smartphone,
    Mail,
    MessageCircle,
    Calendar,
    Volume2,
    VolumeX
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationSettings = () => {
    const navigation = useNavigation();
    const [settings, setSettings] = useState({
        billReminders: true,
        subscriptionReminders: true,
        overdueAlerts: true,
        paymentConfirmations: true,
        lowBalanceAlerts: true,
        pushNotifications: true,
        smsNotifications: false,
        emailNotifications: false,
        whatsappNotifications: false,
        reminderDays: 3,
        preferredTime: '09:00',
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        weekendReminders: true,
        soundEnabled: true,
        vibrationEnabled: true,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const stored = await AsyncStorage.getItem('notificationSettings');
            if (stored) setSettings(JSON.parse(stored));
        } catch (err) {
            console.log('Using default notification settings');
        }
    };

    const saveSettings = async (newSettings) => {
        try {
            await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (err) {
            Alert.alert('Error', 'Failed to save settings');
        }
    };

    const toggleSetting = (key) => {
        saveSettings({ ...settings, [key]: !settings[key] });
    };

    const updateValue = (key, value) => {
        saveSettings({ ...settings, [key]: value });
    };

    const SettingRow = ({ icon: Icon, label, value, onToggle, description }) => (
        <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
                <View style={styles.settingIconBg}>
                    <Icon size={20} color={MyColours.primary || '#53b175'} />
                </View>
                <View>
                    <Text style={styles.settingLabel}>{label}</Text>
                    {description && <Text style={styles.settingDesc}>{description}</Text>}
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#E0E0E0', true: (MyColours.primary || '#53b175') + '80' }}
                thumbColor={value ? (MyColours.primary || '#53b175') : '#f4f3f4'}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reminder Types</Text>
                    <SettingRow
                        icon={Bell}
                        label="Bill Reminders"
                        description={`${settings.reminderDays} days before due date`}
                        value={settings.billReminders}
                        onToggle={() => toggleSetting('billReminders')}
                    />
                    <SettingRow
                        icon={BellRing}
                        label="Subscription Renewals"
                        description="Before next billing date"
                        value={settings.subscriptionReminders}
                        onToggle={() => toggleSetting('subscriptionReminders')}
                    />
                    <SettingRow
                        icon={AlertTriangle}
                        label="Overdue Alerts"
                        description="When bills pass due date"
                        value={settings.overdueAlerts}
                        onToggle={() => toggleSetting('overdueAlerts')}
                    />
                    <SettingRow
                        icon={CheckCircle2}
                        label="Payment Confirmations"
                        description="After successful payment"
                        value={settings.paymentConfirmations}
                        onToggle={() => toggleSetting('paymentConfirmations')}
                    />
                    <SettingRow
                        icon={DollarSign}
                        label="Low Balance Alerts"
                        description="When wallet balance is low"
                        value={settings.lowBalanceAlerts}
                        onToggle={() => toggleSetting('lowBalanceAlerts')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notification Channels</Text>
                    <SettingRow
                        icon={Smartphone}
                        label="Push Notifications"
                        value={settings.pushNotifications}
                        onToggle={() => toggleSetting('pushNotifications')}
                    />
                    <SettingRow
                        icon={MessageCircle}
                        label="SMS"
                        description="Standard SMS rates apply"
                        value={settings.smsNotifications}
                        onToggle={() => toggleSetting('smsNotifications')}
                    />
                    <SettingRow
                        icon={Mail}
                        label="Email"
                        value={settings.emailNotifications}
                        onToggle={() => toggleSetting('emailNotifications')}
                    />
                    <SettingRow
                        icon={MessageCircle}
                        label="WhatsApp"
                        description="Requires WhatsApp Business"
                        value={settings.whatsappNotifications}
                        onToggle={() => toggleSetting('whatsappNotifications')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Timing & Preferences</Text>
                    <View style={styles.timingRow}>
                        <Text style={styles.timingLabel}>Remind me</Text>
                        <View style={styles.timingInputGroup}>
                            <TextInput
                                style={styles.timingInput}
                                value={String(settings.reminderDays)}
                                onChangeText={(v) => updateValue('reminderDays', parseInt(v) || 1)}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            <Text style={styles.timingUnit}>days before</Text>
                        </View>
                    </View>
                    <SettingRow
                        icon={Moon}
                        label="Quiet Hours"
                        description={`${settings.quietHoursStart} — ${settings.quietHoursEnd}`}
                        value={settings.quietHoursEnabled}
                        onToggle={() => toggleSetting('quietHoursEnabled')}
                    />
                    <SettingRow
                        icon={Calendar}
                        label="Weekend Reminders"
                        value={settings.weekendReminders}
                        onToggle={() => toggleSetting('weekendReminders')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sound & Vibration</Text>
                    <SettingRow
                        icon={settings.soundEnabled ? Volume2 : VolumeX}
                        label="Notification Sound"
                        value={settings.soundEnabled}
                        onToggle={() => toggleSetting('soundEnabled')}
                    />
                    <SettingRow
                        icon={Smartphone}
                        label="Vibration"
                        value={settings.vibrationEnabled}
                        onToggle={() => toggleSetting('vibrationEnabled')}
                    />
                </View>

                <TouchableOpacity
                    style={styles.testBtn}
                    onPress={() => Alert.alert('Test Notification', 'A test notification has been sent.')}
                >
                    <Bell size={18} color={MyColours.primary || '#53b175'} />
                    <Text style={styles.testBtnText}>Send Test Notification</Text>
                </TouchableOpacity>
            </ScrollView>
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
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#757575',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    settingIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    settingDesc: {
        fontSize: 12,
        color: '#757575',
    },
    timingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    timingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    timingInputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timingInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 10,
        width: 50,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    timingUnit: {
        fontSize: 14,
        color: '#757575',
    },
    testBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#53b175',
    },
    testBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#53b175',
    },
});

export default NotificationSettings;
