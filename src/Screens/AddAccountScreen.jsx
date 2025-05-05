import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

const AddAccountScreen = ({ navigation }) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  
  // Form state
  const [accountName, setAccountName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [accountType, setAccountType] = useState('checking');
  const [currency, setCurrency] = useState('USD');

  const handleSave = async () => {
    // Basic validation
    if (!accountName.trim() || !institutionName.trim() || !initialBalance || !accountType || !currency) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Numeric validation for balance
    if (isNaN(initialBalance)) {
      Alert.alert('Error', 'Initial balance must be a number');
      return;
    }

    try {
      const { error } = await supabase
        .from('accounts')
        .insert({
          account_name: accountName,
          institution_name: institutionName,
          initial_balance: parseFloat(initialBalance),
          last_four_digits: lastFourDigits,
          account_type: accountType,
          currency,
          user_id: user.id
        });

      if (error) throw error;

      // Navigate back on success
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create account');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Account Name *</Text>
      <TextInput
        style={styles.input}
        value={accountName}
        onChangeText={setAccountName}
        placeholder="e.g., My Primary Checking"
      />

      <Text style={styles.label}>Institution Name *</Text>
      <TextInput
        style={styles.input}
        value={institutionName}
        onChangeText={setInstitutionName}
        placeholder="e.g., Bank of America"
      />

      <Text style={styles.label}>Initial Balance *</Text>
      <TextInput
        style={styles.input}
        value={initialBalance}
        onChangeText={setInitialBalance}
        placeholder="0.00"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Last 4 Digits (Optional)</Text>
      <TextInput
        style={styles.input}
        value={lastFourDigits}
        onChangeText={setLastFourDigits}
        placeholder="1234"
        keyboardType="numeric"
        maxLength={4}
      />

      <Text style={styles.label}>Account Type *</Text>
      <Picker
        selectedValue={accountType}
        onValueChange={(itemValue) => setAccountType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Checking" value="checking" />
        <Picker.Item label="Savings" value="savings" />
        <Picker.Item label="Credit Card" value="credit_card" />
      </Picker>

      <Text style={styles.label}>Currency *</Text>
      <Picker
        selectedValue={currency}
        onValueChange={(itemValue) => setCurrency(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="US Dollar (USD)" value="USD" />
        <Picker.Item label= "Jamaican Dollar (JMD)" value="JMD" />
        <Picker.Item label="Euro (EUR)" value="EUR" />
        <Picker.Item label="British Pound (GBP)" value="GBP" />
      </Picker>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    marginTop: 32,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddAccountScreen;