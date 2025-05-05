import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

import { dummyBankData } from '../Utils/DummyData';

const dummyAccounts = {
  NCB: [
    { id: '1', name: 'Chequing', number: '1234', balance: 5432.10 },
    { id: '2', name: 'Savings', number: '5678', balance: 12800.50 },
    { id: '3', name: 'Credit Card', number: '9012', balance: -1500.00 },
  ],
  Scotia: [
    { id: '4', name: 'Everyday Banking', number: '3456', balance: 2345.67 },
    { id: '5', name: 'Premium Savings', number: '7890', balance: 8900.00 },
  ],
};

const SelectFakeAccountsScreen = () => {
  const [selectedAccounts, setSelectedAccounts] = useState({});
  const [loading, setLoading] = useState(false);
  const { params } = useRoute();
  const navigation = useNavigation();
  const supabase = useSupabaseClient();
  const user = useUser();
  const { bankName } = params;

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
    }));

    const { error } = await supabase
      .from('transactions')
      .insert(transactions.map(tx => ({
        ...tx,
        account_id: accountId,
        user_id: user.id,
      })));

    if (error) console.error('Error seeding transactions:', error);
  };

  const handleAddAccounts = async () => {
    setLoading(true);
    const accountsToAdd = dummyAccounts[bankName].filter(acc => selectedAccounts[acc.id]);

    for (const account of accountsToAdd) {
      // Insert account
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          name: `${bankName} ${account.name}`,
          number: account.number,
          balance: account.balance,
          user_id: user.id,
          bank_name: bankName,
        })
        .select()
        .single();

      if (data) await seedTransactions(data.id);
      if (error) console.error('Error inserting account:', error);
    }

    setLoading(false);
    navigation.navigate('Home');
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
              Balance: {account.balance.toLocaleString('en-US', {
                style: 'currency',
                currency: 'JMD',
              })}
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