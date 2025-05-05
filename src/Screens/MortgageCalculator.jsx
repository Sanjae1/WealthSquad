import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Button, Card, DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { LineChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 40;

const MortgageCalculator = () => {
  // State Management
  const [salePrice, setSalePrice] = useState('');
  const [downPaymentPercent] = useState(10);
  const [interestRate, setInterestRate] = useState('4');
  const [loanTerm, setLoanTerm] = useState('30');
  const [showAmortization, setShowAmortization] = useState(false);

  // Input validation
  const validateNumber = (text) => {
    const regex = /^[0-9]*\.?[0-9]*$/;
    return regex.test(text) ? text : '';
  };

  // Calculation Logic
  const calculateMortgage = () => {
    const price = parseFloat(salePrice) || 0;
    const downPayment = price * (downPaymentPercent / 100);
    const loanAmount = price - downPayment;
    const interestRateNum = parseFloat(interestRate) || 0;
    const monthlyRate = interestRateNum / 100 / 12;
    const payments = parseInt(loanTerm) * 12;

    let monthlyPayment = 0;
    if (loanAmount > 0) {
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / payments;
      } else {
        monthlyPayment =
          (loanAmount * monthlyRate) /
          (1 - Math.pow(1 + monthlyRate, -payments));
      }
    }

    // Amortization Schedule
    const amortization = [];
    let balance = loanAmount;
    for (let i = 0; i < payments; i++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance -= principal;
      amortization.push({
        month: i + 1,
        principal: principal.toFixed(2),
        interest: interest.toFixed(2),
        balance: balance.toFixed(2),
      });
    }

    return {
      downPayment,
      loanAmount,
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPayment: (monthlyPayment * payments).toFixed(2),
      totalInterest: (monthlyPayment * payments - loanAmount).toFixed(2),
      amortization,
    };
  };

  const results = calculateMortgage();

  // Chart data for pie chart
  const pieChartData = [
    {
      name: 'Principal',
      value: results.loanAmount,
      color: '#2ecc71',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: 'Interest',
      value: parseFloat(results.totalInterest) || 0,
      color: '#e74c3c',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }
  ];

  // Chart data for line chart (balance over time)
  const lineChartData = {
    labels: ['0%', '25%', '50%', '75%', '100%'],
    datasets: [
      {
        data: results.loanAmount > 0 ? [
          parseFloat(results.amortization[0]?.balance || 0),
          parseFloat(results.amortization[Math.floor(results.amortization.length * 0.25)]?.balance || 0),
          parseFloat(results.amortization[Math.floor(results.amortization.length * 0.5)]?.balance || 0),
          parseFloat(results.amortization[Math.floor(results.amortization.length * 0.75)]?.balance || 0),
          0
        ] : [0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ['Loan Balance']
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Mortgage Calculator" />
        <Card.Content>
          {/* Input Section */}
          <TextInput
            style={styles.input}
            placeholder="Home Price ($)"
            keyboardType="numeric"
            value={salePrice}
            onChangeText={(text) => setSalePrice(validateNumber(text))}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Down Payment:</Text>
            <Text style={styles.value}>
              {downPaymentPercent}% (${results.downPayment.toLocaleString()})
            </Text>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Text style={styles.label}>Interest Rate (%)</Text>
              <TextInput
                style={styles.smallInput}
                keyboardType="numeric"
                value={interestRate}
                onChangeText={(text) => setInterestRate(validateNumber(text))}
              />
            </View>

            <View style={styles.inputColumn}>
              <Text style={styles.label}>Loan Term</Text>
              <Picker
                selectedValue={loanTerm}
                onValueChange={setLoanTerm}
                style={styles.picker}>
                {[10, 15, 20, 25, 30].map((term) => (
                  <Picker.Item
                    key={term}
                    label={`${term} Years`}
                    value={String(term)}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Results Section */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultHeader}>Monthly Payment:</Text>
            <Text style={styles.payment}>${results.monthlyPayment}</Text>

            <View style={styles.summary}>
              <Text>Total Payments: ${parseFloat(results.totalPayment).toLocaleString()}</Text>
              <Text>Total Interest: ${parseFloat(results.totalInterest).toLocaleString()}</Text>
            </View>

            {/* Visualizations */}
            {results.loanAmount > 0 && (
              <>
                <Text style={styles.chartTitle}>Payment Breakdown</Text>
                <PieChart
                  data={pieChartData}
                  width={screenWidth}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="value"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />

                <Text style={styles.chartTitle}>Balance Over Time</Text>
                <LineChart
                  data={lineChartData}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </>
            )}
          </View>

          {/* Amortization Schedule */}
          {results.loanAmount > 0 && (
            <>
              <Button
                mode="contained"
                onPress={() => setShowAmortization(!showAmortization)}
                style={styles.toggleButton}>
                {showAmortization ? 'Hide' : 'Show'} Amortization Schedule
              </Button>

              {showAmortization && (
                <DataTable style={styles.table}>
                  <DataTable.Header>
                    <DataTable.Title>Month</DataTable.Title>
                    <DataTable.Title numeric>Principal</DataTable.Title>
                    <DataTable.Title numeric>Interest</DataTable.Title>
                    <DataTable.Title numeric>Balance</DataTable.Title>
                  </DataTable.Header>

                  {results.amortization.slice(0, 12).map((entry) => (
                    <DataTable.Row key={entry.month}>
                      <DataTable.Cell>{entry.month}</DataTable.Cell>
                      <DataTable.Cell numeric>${entry.principal}</DataTable.Cell>
                      <DataTable.Cell numeric>${entry.interest}</DataTable.Cell>
                      <DataTable.Cell numeric>${entry.balance}</DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>
              )}
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

// Styles with added chart styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { marginBottom: 20 },
  input: { 
    marginBottom: 15,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16
  },
  inputRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  inputColumn: { 
    width: '48%' 
  },
  picker: { 
    height: 50, 
    backgroundColor: 'white',
    borderRadius: 8
  },
  resultsContainer: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  resultHeader: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  payment: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#2ecc71', 
    marginBottom: 15 
  },
  summary: { 
    marginBottom: 20, 
    alignItems: 'center' 
  },
  table: { 
    marginTop: 20 
  },
  toggleButton: { 
    marginTop: 15 
  },
  inputGroup: { marginBottom: 15 },
  label: { marginBottom: 5 },
  value: { fontSize: 16 },
  smallInput: { 
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center'
  }
});

export default MortgageCalculator;