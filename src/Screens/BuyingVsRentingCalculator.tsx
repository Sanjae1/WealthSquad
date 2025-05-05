// screens/Calculators/BuyVsRentCalculator.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Button, Card, Divider, TextInput } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const BuyVsRentCalculator = () => {
  const { colors } = useTheme();
  const [inputs, setInputs] = useState({
    purchasePrice: '',
    downPayment: '',
    interestRate: '4',
    loanTerm: '30',
    rentCost: '',
    years: '10'
  });

  const screenWidth = Dimensions.get('window').width;

  const calculateScenario = () => {
    const price = parseFloat(inputs.purchasePrice) || 0;
    const down = parseFloat(inputs.downPayment) || 0;
    const rate = parseFloat(inputs.interestRate) / 100 / 12;
    const term = parseInt(inputs.loanTerm) * 12;
    const monthlyRent = parseFloat(inputs.rentCost) || 0;
    const totalYears = parseInt(inputs.years);

    const loanAmount = price - down;
    const monthlyMortgage = (loanAmount * rate) / 
      (1 - Math.pow(1 + rate, -term));

    const totalBuyCost = monthlyMortgage * 12 * totalYears + down;
    const totalRentCost = monthlyRent * 12 * totalYears;

    return {
      monthlyMortgage: monthlyMortgage,
      totalBuyCost: totalBuyCost,
      totalRentCost: totalRentCost,
      difference: totalBuyCost - totalRentCost
    };
  };

  const results = calculateScenario();

  const formatCurrency = (value: number) => 
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const chartData = {
    labels: ['Buying', 'Renting'],
    datasets: [{
      data: [results.totalBuyCost, results.totalRentCost]
    }]
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title 
          title="Buy vs Rent Calculator"
          titleStyle={styles.title}
          left={() => <MaterialCommunityIcons name="home-switch" size={24} color={colors.primary} />}
        />
        
        <Card.Content>
          {/* Input Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialCommunityIcons name="currency-usd" size={16} /> Purchase Details
            </Text>
            <TextInput
              mode="outlined"
              label="Purchase Price"
              keyboardType="numeric"
              value={inputs.purchasePrice}
              onChangeText={text => setInputs({...inputs, purchasePrice: text})}
              left={<TextInput.Affix text="$" />}
              style={styles.input}
            />
            
            <TextInput
              mode="outlined"
              label="Down Payment"
              keyboardType="numeric"
              value={inputs.downPayment}
              onChangeText={text => setInputs({...inputs, downPayment: text})}
              left={<TextInput.Affix text="$" />}
              style={styles.input}
            />

            <View style={styles.row}>
              <TextInput
                mode="outlined"
                label="Interest Rate (%)"
                keyboardType="numeric"
                value={inputs.interestRate}
                onChangeText={text => setInputs({...inputs, interestRate: text})}
                style={[styles.input, { flex: 1, marginRight: 8 }]}
              />
              <TextInput
                mode="outlined"
                label="Loan Term (years)"
                keyboardType="numeric"
                value={inputs.loanTerm}
                onChangeText={text => setInputs({...inputs, loanTerm: text})}
                style={[styles.input, { flex: 1 }]}
              />
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialCommunityIcons name="calendar" size={16} /> Rental Details
            </Text>
            <TextInput
              mode="outlined"
              label="Monthly Rent"
              keyboardType="numeric"
              value={inputs.rentCost}
              onChangeText={text => setInputs({...inputs, rentCost: text})}
              left={<TextInput.Affix text="$" />}
              style={styles.input}
            />
            
            <TextInput
              mode="outlined"
              label="Comparison Period (years)"
              keyboardType="numeric"
              value={inputs.years}
              onChangeText={text => setInputs({...inputs, years: text})}
              style={styles.input}
            />
          </View>

          {/* Results Section */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {inputs.years} Year Comparison
            </Text>
            
            <View style={styles.resultsGrid}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Monthly Mortgage</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(results.monthlyMortgage)}
                </Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Total Buying Cost</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(results.totalBuyCost)}
                </Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Total Renting Cost</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(results.totalRentCost)}
                </Text>
              </View>
            </View>

            <View style={[
              styles.differenceBadge,
              results.difference > 0 
                ? styles.negativeDifference 
                : styles.positiveDifference
            ]}>
              <Text style={styles.differenceText}>
                {results.difference > 0 ? 'Buying costs' : 'Renting saves'}
                {'\n'}
                {formatCurrency(Math.abs(results.difference))}
              </Text>
            </View>
          </View>

          {/* Chart Section */}
          <BarChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel="$"
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(53, 186, 140, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              barPercentage: 0.5,
            }}
            style={styles.chart}
            verticalLabelRotation={0}
            fromZero
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { borderRadius: 12 },
  title: { fontSize: 20, fontWeight: '600' },
  section: { marginVertical: 8 },
  sectionTitle: { 
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 12,
    color: '#2c3e50'
  },
  input: { marginBottom: 12 },
  row: { flexDirection: 'row' },
  divider: { marginVertical: 16, height: 1 },
  resultsContainer: { marginVertical: 16 },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  resultItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  resultLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500'
  },
  differenceBadge: {
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginVertical: 16
  },
  positiveDifference: { backgroundColor: '#e8f5e9' },
  negativeDifference: { backgroundColor: '#ffebee' },
  differenceText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  chart: {
    borderRadius: 12,
    marginVertical: 16
  }
});

export default BuyVsRentCalculator;