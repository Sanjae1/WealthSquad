// screens/Calculators/TravelCalculator.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Picker } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { VictoryBar, VictoryChart } from 'victory-native';

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

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Travel Calculator" />
        <Card.Content>
          <Picker
            selectedValue={tripType}
            onValueChange={setTripType}
            style={styles.picker}>
            <Picker.Item label="Flight" value="flight" />
            <Picker.Item label="Car" value="car" />
          </Picker>

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

          <VictoryChart>
            <VictoryBar
              data={[
                { x: 'Transport', y: parseFloat(transport) || 0 },
                { x: 'Lodging', y: parseFloat(lodging) || 0 },
                { x: 'Food', y: parseFloat(food) || 0 },
                { x: 'Activities', y: parseFloat(activities) || 0 }
              ]}
            />
          </VictoryChart>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};