import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { ArrowLeft, Info } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatJMD, getBillerById, formatJamaicanDate } from '../Data/billers';
import { MyColours } from '../Utils/MyColours';

const BillDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { bill } = route.params || {};
    const biller = getBillerById(bill?.billerId);

    if (!bill) return null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bill Details</Text>
                <View style={{ width: 40 }} />
            </View>
            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.label}>Biller</Text>
                    <Text style={styles.value}>{biller?.name}</Text>
                    <Text style={styles.label}>Amount Due</Text>
                    <Text style={[styles.value, { color: MyColours.error }]}>{formatJMD(bill.amountDue || bill.amount)}</Text>
                    <Text style={styles.label}>Due Date</Text>
                    <Text style={styles.value}>{formatJamaicanDate(bill.dueDate)}</Text>
                    <Text style={styles.label}>Account Number</Text>
                    <Text style={styles.value}>{bill.accountNumber}</Text>
                </View>
                <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => navigation.navigate('PayBill', { bill })}
                >
                    <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    backButton: { padding: 8, borderRadius: 12, backgroundColor: '#fff' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    content: { padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24 },
    label: { fontSize: 12, color: '#757575', marginBottom: 4, textTransform: 'uppercase' },
    value: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
    payButton: { backgroundColor: '#53b175', borderRadius: 16, padding: 16, alignItems: 'center' },
    payButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default BillDetails;
