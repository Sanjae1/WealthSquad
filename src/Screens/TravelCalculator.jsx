// screens/Calculators/TravelCalculator.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';

const screenWidth = Dimensions.get('window').width;

const TravelCalculator = () => {
  const [tripType, setTripType] = useState('flight');
  const [people, setPeople] = useState('1');
  const [allowance, setAllowance] = useState('');
  const [transport, setTransport] = useState('');
  const [lodging, setLodging] = useState('');
  const [food, setFood] = useState('');
  const [activities, setActivities] = useState('');

  const calculateTrip = () => {
    const numPeople = parseInt(people) || 1;
    const totalTransport = parseFloat(transport) || 0;
    const totalLodging = parseFloat(lodging) || 0;
    const totalFood = parseFloat(food) || 0;
    const totalActivities = parseFloat(activities) || 0;

    const totalCost = (totalTransport + totalLodging + 
                      totalFood + totalActivities) * numPeople;
    const budget = parseFloat(allowance) || 0;
    const difference = budget - totalCost;

    return {
      totalCost,
      budget,
      difference,
      perPerson: totalCost / numPeople
    };
  };

  const results = calculateTrip();

  const chartData = {
    labels: ['Transport', 'Lodging', 'Food', 'Activities'],
    datasets: [{
      data: [
        parseFloat(transport) || 0,
        parseFloat(lodging) || 0,
        parseFloat(food) || 0,
        parseFloat(activities) || 0
      ]
    }]
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Travel Calculator" />
        <Card.Content>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tripType}
              onValueChange={setTripType}
              style={styles.picker}>
              <Picker.Item label="Flight" value="flight" />
              <Picker.Item label="Car" value="car" />
            </Picker>
          </View>

          <TextInput style={styles.input}
            placeholder="Number of People"
            keyboardType="numeric"
            value={people}
            onChangeText={setPeople}
          />

          <TextInput style={styles.input}
            placeholder="Total Trip Allowance"
            keyboardType="numeric"
            value={allowance}
            onChangeText={setAllowance}
          />

          <Text style={styles.sectionHeader}>Expenses</Text>
          <TextInput style={styles.input}
            placeholder={`${tripType === 'car' ? 'Fuel/Car Rental' : 'Flight'} Cost`}
            keyboardType="numeric"
            value={transport}
            onChangeText={setTransport}
          />

          <TextInput style={styles.input}
            placeholder="Lodging Cost"
            keyboardType="numeric"
            value={lodging}
            onChangeText={setLodging}
          />

          <TextInput style={styles.input}
            placeholder="Food & Drink Cost"
            keyboardType="numeric"
            value={food}
            onChangeText={setFood}
          />

          <TextInput style={styles.input}
            placeholder="Activities Cost"
            keyboardType="numeric"
            value={activities}
            onChangeText={setActivities}
          />

          <Text style={styles.resultText}>
            Total Expected Cost: ${results.totalCost.toFixed(2)}
          </Text>
          <Text style={results.difference >= 0 ? styles.underBudget : styles.overBudget}>
            {results.difference >= 0 ? 'Under Budget' : 'Over Budget'}: 
            ${Math.abs(results.difference).toFixed(2)}
          </Text>

          <View style={styles.chartContainer}>
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
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                barPercentage: 0.5,
              }}
              style={styles.chart}
              verticalLabelRotation={30}
            />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  underBudget: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 16,
  },
  overBudget: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 16,
  },
  chartContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default TravelCalculator;