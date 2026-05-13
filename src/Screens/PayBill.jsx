import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatJMD, getBillerById } from '../Data/billers';

const PayBill = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { bill } = route.params || {};
    const biller = getBillerById(bill?.billerId);

    const handlePay = () => {
        Alert.alert('Success', 'Payment processed successfully', [
            { text: 'OK', onPress: () => navigation.navigate('BillPayDashboard') }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pay Bill</Text>
                <View style={{ width: 40 }} />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>Confirm Payment to {biller?.shortName}</Text>
                <Text style={styles.amount}>{formatJMD(bill?.amountDue || bill?.amount)}</Text>

                <TouchableOpacity style={styles.confirmButton} onPress={handlePay}>
                    <Text style={styles.confirmButtonText}>Confirm Payment</Text>
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
    content: { padding: 24, alignItems: 'center', justifyContent: 'center', flex: 1 },
    title: { fontSize: 18, fontWeight: '600', color: '#757575', marginBottom: 12 },
    amount: { fontSize: 48, fontWeight: '800', color: '#333', marginBottom: 40 },
    confirmButton: { backgroundColor: '#53b175', borderRadius: 16, padding: 20, width: '100%', alignItems: 'center' },
    confirmButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

export default PayBill;
