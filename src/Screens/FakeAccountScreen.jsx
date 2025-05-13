import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

import { dummyBankData } from '../Utils/DummyData';

const dummyAccounts = {
  'NCB Jamaica': [
    { id: '1', name: 'Chequing', number: '1234', balance: 5432.10 },
    { id: '2', name: 'Savings', number: '5678', balance: 12800.50 },
    { id: '3', name: 'Credit Card', number: '9012', balance: -1500.00 },
  ],
  'Scotiabank Jamaica': [
    { id: '4', name: 'Everyday Banking', number: '3456', balance: 2345.67 },
    { id: '5', name: 'Premium Savings', number: '7890', balance: 8900.00 },
  ],
  'CIBC FirstCaribbean (Jamaica)': [
    { id: '6', name: 'Personal Chequing', number: '2345', balance: 3456.78 },
    { id: '7', name: 'High Interest Savings', number: '6789', balance: 15678.90 },
  ],
  'Jamaica National Bank': [
    { id: '8', name: 'JN Chequing Direct', number: '3456', balance: 6200.00 },
    { id: '9', name: 'JN Goal Saver', number: '7890', balance: 150500.90 },
  ],
};

const SelectFakeAccountsScreen = () => {
  const [selectedAccounts, setSelectedAccounts] = useState({});
  const [loading, setLoading] = useState(false);
  const { params } = useRoute();
  const navigation = useNavigation();
  const supabase = useSupabaseClient();
  const user = useUser();
  const { selectedBank } = params;
  const bankName = selectedBank?.name;

  const toggleAccount = (accountId) => {
    setSelectedAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const seedTransactions = async (accountId) => {
    // Sample transactions array
    const transactions = Array.from({ length: 15 }, (_, i) => ({
      amount: Math.floor(Math.random() * 2000) - 1000,
      merchant: ['Grocery Mart', 'Gas Station', 'Online Retailer', 'Restaurant'][i % 4],
      category: ['Food', 'Transport', 'Shopping', 'Dining'][i % 4],
      date: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
      user_id: user.id,
      account_id: accountId, // Make sure this matches your database schema
      description: `Transaction at ${['Grocery Mart', 'Gas Station', 'Online Retailer', 'Restaurant'][i % 4]}`,
      status: 'completed'
    }));

    try {
      const { error } = await supabase
        .from('transactions')
        .insert(transactions);

      if (error) {
        console.error('Error seeding transactions:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in seedTransactions:', error);
    }
  };

  const handleAddAccounts = async () => {
    setLoading(true);
    const accountsToAdd = dummyAccounts[bankName].filter(acc => selectedAccounts[acc.id]);

    for (const account of accountsToAdd) {
      try {
        // Insert account
        const { data, error } = await supabase
          .from('accounts')
          .insert({
            account_name: `${bankName} ${account.name}`,
            institution_name: bankName,
            balance: account.balance,
            last_four_digits: account.number,
            account_type: account.name.toLowerCase().includes('credit') ? 'credit_card' : 
                         account.name.toLowerCase().includes('savings') ? 'savings' : 'checking',
            currency: 'JMD',
            user_id: user.id
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting account:', error);
          continue;
        }

        if (data) {
          // Seed transactions for this account
          await seedTransactions(data.id);
        }
      } catch (error) {
        console.error('Error in account creation process:', error);
      }
    }

    setLoading(false);
    // Navigate to AppMain instead of Home
    navigation.reset({
      index: 0,
      routes: [{ name: 'AppMain' }],
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select Accounts to Add</Text>
      
      {dummyAccounts[bankName]?.map((account) => (
        <TouchableOpacity
          key={account.id}
          style={styles.accountItem}
          onPress={() => toggleAccount(account.id)}
        >
          <Icon
            name={selectedAccounts[account.id] ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color="#4CAF50"
          />
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>
              {bankName} {account.name} (****{account.number})
            </Text>
            <Text style={styles.balance}>
              Balance: <Text>{account.balance.toLocaleString('en-US', {
                style: 'currency',
                currency: 'JMD',
              })}</Text>
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleAddAccounts}>
          <Text style={styles.buttonText}>Add Selected Accounts</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
  },
  balance: {
    color: '#757575',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});


export default SelectFakeAccountsScreen;