// src/Services/NotificationManager.js
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { formatJMD, getDaysUntil, getBillerById, formatJamaicanDate } from '../Data/billers';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationManager {
    constructor() {
        this.notificationListener = null;
        this.responseListener = null;
    }

    async requestPermissions() {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return false;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('bills', {
                name: 'Bill Reminders',
                importance: Notifications.AndroidImportance.HIGH,
            });

            await Notifications.setNotificationChannelAsync('subscriptions', {
                name: 'Subscription Renewals',
                importance: Notifications.AndroidImportance.DEFAULT,
            });

            await Notifications.setNotificationChannelAsync('urgent', {
                name: 'Urgent Alerts',
                importance: Notifications.AndroidImportance.HIGH,
            });
        }

        return true;
    }

    async scheduleBillReminder(bill, daysBefore = 3) {
        const biller = getBillerById(bill.billerId);
        const dueDate = new Date(bill.dueDate);
        const reminderDate = new Date(dueDate);
        reminderDate.setDate(dueDate.getDate() - daysBefore);
        reminderDate.setHours(9, 0, 0, 0);

        if (reminderDate < new Date()) return null;

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: `💡 ${biller?.shortName || 'Bill'} Due Soon`,
                body: `${formatJMD(bill.amountDue || bill.amount)} due in ${daysBefore} days.`,
                data: {
                    type: 'bill_reminder',
                    billId: bill.id,
                    screen: 'PayBill',
                    params: { bill }
                },
            },
            trigger: {
                date: reminderDate,
                channelId: 'bills',
            },
        });

        return notificationId;
    }

    async scheduleSubscriptionRenewal(sub) {
        const renewalDate = new Date(sub.nextBillingDate);
        const reminderDate = new Date(renewalDate);
        reminderDate.setDate(renewalDate.getDate() - (sub.reminderDays || 3));
        reminderDate.setHours(10, 0, 0, 0);

        if (reminderDate < new Date()) return null;

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: `🔄 ${sub.name} Renews Soon`,
                body: `${formatJMD(sub.amount)} will be charged on ${formatJamaicanDate(sub.nextBillingDate)}.`,
                data: {
                    type: 'subscription_reminder',
                    subscriptionId: sub.id,
                    screen: 'SubscriptionDetails',
                    params: { subscription: sub }
                },
            },
            trigger: {
                date: reminderDate,
                channelId: 'subscriptions',
            },
        });

        return notificationId;
    }

    setupListeners(navigation) {
        this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received:', notification);
        });

        this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data.screen && navigation) {
                navigation.navigate(data.screen, data.params);
            }
        });
    }

    removeListeners() {
        if (this.notificationListener) {
            Notifications.removeNotificationSubscription(this.notificationListener);
        }
        if (this.responseListener) {
            Notifications.removeNotificationSubscription(this.responseListener);
        }
    }
}

export const notificationManager = new NotificationManager();
