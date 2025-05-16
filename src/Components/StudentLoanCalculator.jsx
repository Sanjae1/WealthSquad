import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Card } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';

const screenWidth = Dimensions.get('window').width;

const StudentLoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('5');
  const [loanTerm, setLoanTerm] = useState('10');
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [totalPayment, setTotalPayment] = useState(null);
  const [totalInterest, setTotalInterest] = useState(null);
  const [amortizationData, setAmortizationData] = useState([]);

  const calculateLoan = () => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const term = parseInt(loanTerm) * 12; // Total number of payments

    if (principal && rate && term) {
      const monthlyPaymentAmount =
        (principal * rate * Math.pow(1 + rate, term)) /
        (Math.pow(1 + rate, term) - 1);
      const totalPaymentAmount = monthlyPaymentAmount * term;
      const totalInterestAmount = totalPaymentAmount - principal;

      // Generate amortization data
      const amortization = [];
      let balance = principal;
      for (let i = 0; i < term; i++) {
        const interest = balance * rate;
        const principalPayment = monthlyPaymentAmount - interest;
        balance -= principalPayment;
        amortization.push({
          month: i + 1,
          principal: principalPayment,
          interest,
          balance
        });
      }

      setMonthlyPayment(monthlyPaymentAmount.toFixed(2));
      setTotalPayment(totalPaymentAmount.toFixed(2));
      setTotalInterest(totalInterestAmount.toFixed(2));
      setAmortizationData(amortization);
    }
  };

  const chartData = {
    labels: amortizationData
      .filter((_, index) => index % 12 === 0)
      .map((_, index) => `Year ${index + 1}`),
    datasets: [{
      data: amortizationData
        .filter((_, index) => index % 12 === 0)
        .map(item => item.balance)
    }]
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.container}>
          <Text style={styles.title}>Student Loan Calculator</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Loan Amount ($)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={loanAmount}
              onChangeText={setLoanAmount}
              placeholder="Enter loan amount"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Interest Rate (%)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={interestRate}
              onChangeText={setInterestRate}
              placeholder="Enter interest rate"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Loan Term (Years)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={loanTerm}
                onValueChange={setLoanTerm}
                style={styles.picker}>
                {[5, 10, 15, 20].map(term => (
                  <Picker.Item key={term} label={`${term} Years`} value={String(term)} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateLoan}>
            <Text style={styles.calculateButtonText}>Calculate</Text>
          </TouchableOpacity>

          {monthlyPayment && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Monthly Payment:</Text>
                <Text style={styles.resultValue}>${monthlyPayment}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Total Payment:</Text>
                <Text style={styles.resultValue}>${totalPayment}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Total Interest:</Text>
                <Text style={styles.resultValue}>${totalInterest}</Text>
              </View>

              {amortizationData.length > 0 && (
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>Loan Balance Over Time</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <LineChart
                      data={chartData}
                      width={Math.max(screenWidth - 64, chartData.labels.length * 60)}
                      height={220}
                      chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForLabels: {
                          fontSize: 10,
                        },
                      }}
                      bezier
                      style={styles.chart}
                    />
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  calculateButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  resultsContainer: {
    marginTop: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    color: '#333',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  chartContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default StudentLoanCalculator; 