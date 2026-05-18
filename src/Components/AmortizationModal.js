// AmortizationModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Appearance,
} from 'react-native';

const formatCurrencySimple = (value) => {
  const num = Number(value);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

const generateAmortizationSchedule = (principal, annualRate, years, M_calculated) => {
  if (principal <= 0 || years <= 0 || M_calculated <= 0) return [];

  const schedule = [];
  let currentBalance = parseFloat(principal);
  const monthlyInterestRate = parseFloat(annualRate) / 100 / 12;
  const numberOfPayments = parseInt(years, 10) * 12;

  if (isNaN(currentBalance) || isNaN(monthlyInterestRate) || isNaN(numberOfPayments) || monthlyInterestRate < 0) {
    console.error("Invalid input for amortization schedule:", {principal, annualRate, years, M_calculated});
    return [];
  }
  
  // Special case for 0% interest rate
  if (monthlyInterestRate === 0) {
    const principalPerMonth = currentBalance / numberOfPayments;
    for (let month = 1; month <= numberOfPayments; month++) {
      currentBalance -= principalPerMonth;
      schedule.push({
        key: String(month),
        month: month,
        payment: principalPerMonth,
        interestPaid: 0,
        principalPaid: principalPerMonth,
        remainingBalance: Math.max(0, currentBalance),
      });
    }
    return schedule;
  }


  for (let month = 1; month <= numberOfPayments; month++) {
    const interestComponent = currentBalance * monthlyInterestRate;
    let principalComponent = M_calculated - interestComponent;
    let actualPaymentThisMonth = M_calculated;

    // Adjust for the last payment or if balance will be overpaid
    // Use a small epsilon for floating point comparisons
    if (currentBalance - principalComponent <= 0.01 || month === numberOfPayments) {
      principalComponent = currentBalance;
      actualPaymentThisMonth = principalComponent + interestComponent;
      currentBalance = 0;
    } else {
      currentBalance -= principalComponent;
    }

    schedule.push({
      key: String(month),
      month: month,
      payment: actualPaymentThisMonth,
      interestPaid: interestComponent,
      principalPaid: principalComponent,
      remainingBalance: Math.max(0, currentBalance), // Ensure no negative balance
    });

    if (currentBalance < 0.01 && month < numberOfPayments) {
      // Loan paid off early, stop.
      break;
    }
  }
  return schedule;
};


const AmortizationModal = ({ visible, onClose, loanDetails }) => {
  const [amortizationData, setAmortizationData] = useState([]);
  const isDarkMode = Appearance.getColorScheme() === 'dark';
  const modalBgColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#E0E0E0' : '#000000';
  const borderColor = isDarkMode ? '#444444' : '#DDDDDD';
  const headerBgColor = isDarkMode ? '#333333' : '#F0F0F0';

  useEffect(() => {
    if (loanDetails && loanDetails.principal && loanDetails.annualRate && loanDetails.years && loanDetails.monthlyPayment) {
      const schedule = generateAmortizationSchedule(
        loanDetails.principal,
        loanDetails.annualRate,
        loanDetails.years,
        loanDetails.monthlyPayment
      );
      setAmortizationData(schedule);
    } else {
      setAmortizationData([]);
    }
  }, [loanDetails]);

  const renderHeader = () => (
    <View style={[styles.row, styles.header, { backgroundColor: headerBgColor, borderBottomColor: borderColor }]}>
      <Text style={[styles.headerCell, styles.cellMonth, { color: textColor }]}>Mth</Text>
      <Text style={[styles.headerCell, styles.cellPayment, { color: textColor }]}>Payment</Text>
      <Text style={[styles.headerCell, styles.cellInterest, { color: textColor }]}>Interest</Text>
      <Text style={[styles.headerCell, styles.cellPrincipal, { color: textColor }]}>Principal</Text>
      <Text style={[styles.headerCell, styles.cellBalance, { color: textColor }]}>Balance</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={[styles.row, { borderBottomColor: borderColor }]}>
      <Text style={[styles.cell, styles.cellMonth, { color: textColor }]}>{item.month}</Text>
      <Text style={[styles.cell, styles.cellPayment, { color: textColor }]}>{formatCurrencySimple(item.payment)}</Text>
      <Text style={[styles.cell, styles.cellInterest, { color: textColor }]}>{formatCurrencySimple(item.interestPaid)}</Text>
      <Text style={[styles.cell, styles.cellPrincipal, { color: textColor }]}>{formatCurrencySimple(item.principalPaid)}</Text>
      <Text style={[styles.cell, styles.cellBalance, { color: textColor }]}>{formatCurrencySimple(item.remainingBalance)}</Text>
    </View>
  );

  if (!loanDetails) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.safeAreaModal, { backgroundColor: modalBgColor }]}>
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            Amortization Schedule - {loanDetails.loanName || 'Loan'}
          </Text>
          <Text style={[styles.modalSubtitle, { color: textColor }]}>
            P: {formatCurrencySimple(loanDetails.principal)} | Rate: {loanDetails.annualRate}% | Term: {loanDetails.years} yrs | M Pmt: {formatCurrencySimple(loanDetails.monthlyPayment)}
          </Text>
          
          {amortizationData.length === 0 ? (
             <Text style={{color: textColor, textAlign: 'center', marginTop: 20}}>
                No data to display. Ensure loan principal, rate, and years are valid.
             </Text>
          ) : (
            <FlatList
                data={amortizationData}
                renderItem={renderItem}
                keyExtractor={(item) => item.key}
                ListHeaderComponent={renderHeader}
                stickyHeaderIndices={[0]} // Makes the header sticky
            />
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeAreaModal: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'center',
    color: '#555'
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 8,
    
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  cell: {
    fontSize: 11,
    paddingHorizontal: 2,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 2,
  },
  cellMonth: { width: '10%', textAlign: 'right' },
  cellPayment: { width: '25%', textAlign: 'right' },
  cellInterest: { width: '22%', textAlign: 'right' },
  cellPrincipal: { width: '22%', textAlign: 'right' },
  cellBalance: { width: '21%', textAlign: 'right' },
  closeButton: {
    backgroundColor: '#00796B', // Teal
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AmortizationModal;