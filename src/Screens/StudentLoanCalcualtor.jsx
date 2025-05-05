// screens/Calculators/StudentLoanCalculator.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Picker } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { VictoryLine } from 'victory-native';

const StudentLoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('5');
  const [loanTerm, setLoanTerm] = useState('10');

  const calculateLoan = () => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) / 100 / 12;
    const term = parseInt(loanTerm) * 12;

    const monthlyPayment = (principal * rate) / 
      (1 - Math.pow(1 + rate, -term));
    const totalPaid = monthlyPayment * term;
    const totalInterest = totalPaid - principal;

    // Generate amortization data
    const amortization = [];
    let balance = principal;
    for (let i = 0; i < term; i++) {
      const interest = balance * rate;
      const principalPayment = monthlyPayment - interest;
      balance -= principalPayment;
      amortization.push({
        month: i + 1,
        principal: principalPayment,
        interest
      });
    }

    return {
      monthlyPayment: monthlyPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      amortization
    };
  };

  const results = calculateLoan();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Student Loan Calculator" />
        <Card.Content>
          <TextInput style={styles.input}
            placeholder="Loan Amount"
            keyboardType="numeric"
            value={loanAmount}
            onChangeText={setLoanAmount}
          />

          <TextInput style={styles.input}
            placeholder="Interest Rate (%)"
            keyboardType="numeric"
            value={interestRate}
            onChangeText={setInterestRate}
          />

          <Picker
            selectedValue={loanTerm}
            onValueChange={setLoanTerm}
            style={styles.picker}>
            {[5, 10, 15, 20].map(term => (
              <Picker.Item key={term} label={`${term} Years`} value={String(term)} />
            ))}
          </Picker>

          <Text style={styles.resultText}>
            Monthly Payment: ${results.monthlyPayment}
          </Text>
          <Text style={styles.resultText}>
            Total Interest: ${results.totalInterest}
          </Text>

          <VictoryLine
            data={results.amortization.map((a, i) => ({
              x: i + 1,
              y: a.principal + a.interest
            }))}
            style={{ data: { stroke: '#c43a31' } }}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};