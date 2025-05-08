import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Using MaterialIcons as per original
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import RecentTransactions from '../Components/RecentTransaction'; // Corrected path assuming Components folder

const Home = () => {
  const navigation = useNavigation();
  const user = useUser();
  const supabase = useSupabaseClient();
  const [accounts, setAccounts] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Starting to fetch accounts for user:', user.id);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase error fetching accounts:', error);
        throw error;
      }

      console.log('Successfully fetched accounts:', data);
      setAccounts(data || []);
      
      // Calculate total balance
      const total = data?.reduce((sum, account) => sum + (account.balance || 0), 0) || 0;
      console.log('Calculated total balance:', total);
      setTotalBalance(total);
    } catch (error) {
      console.error('Error in fetchAccounts:', error);
      Alert.alert('Error', 'Failed to load accounts. Please try again.');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  }, [user, supabase]);

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Home screen focused, user:', user?.id);
      fetchAccounts();
    }, [fetchAccounts])
  );

  const handleLogout = async () => {
    try {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Logout',
            onPress: async () => {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
              
              // Reset navigation to Login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome, {user?.user_metadata?.full_name || 'User'}!</Text>
          {/* Optional: Add a logout button here if not in settings */}
           <TouchableOpacity onPress={handleLogout}>
             <Icon name="logout" size={24} color="#757575" />
           </TouchableOpacity>
        </View>

        <View style={styles.accountSummary}>
          <Text style={styles.sectionTitle}>Account Summary</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading accounts...</Text>
            </View>
          ) : (
            <>
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceAmount}>
                  {totalBalance.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'JMD'
                  })}
                </Text>
              </View>
              
              {/* List of accounts */}
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <View key={account.id} style={styles.accountItem}>
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>{account.name}</Text>
                      <Text style={styles.accountNumber}>****{account.number}</Text>
                    </View>
                    <Text style={[
                      styles.accountBalance,
                      { color: account.balance >= 0 ? '#4CAF50' : '#E74C3C' }
                    ]}>
                      {account.balance.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'JMD'
                      })}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noAccountsText}>No accounts added yet</Text>
              )}
            </>
          )}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtonsContainer}>
            {/* Navigate to the screen defined in App.js Stack */}
            <TouchableOpacity onPress={() => navigation.navigate('SelectBankScreen')}>
              <ActionButton icon="add" label="Add Account" />
            </TouchableOpacity>
            {/* Navigate to the Budget *Tab* */}
            <TouchableOpacity onPress={() => navigation.navigate('BudgetTab')}>
              <ActionButton icon="attach-money" label="Budget" />
            </TouchableOpacity>
            <ActionButton icon="trending-up" label="Investments" />
          </View>
        </View>

        {/* Ensure RecentTransactions component exists and works */}
        <RecentTransactions />

      </ScrollView>

      {/* REMOVED the commented-out manual bottom navigation */}

    </SafeAreaView>
  );
};

// ActionButton component remains the same
const ActionButton = ({ icon, label }) => (
  <View style={styles.actionButton}>
    <Icon name={icon} size={24} color="#4CAF50" />
    <Text style={styles.actionButtonLabel}>{label}</Text>
  </View>
);

// Transaction component can be removed if RecentTransactions handles display
// const Transaction = ({ merchant, amount, date, category }) => ( ... );

// Styles remain largely the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
   header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16, // Adjust padding as needed
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16, // Add padding to section titles if needed
  },
  accountSummary: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    // Removed shadow props, use elevation for Android if needed
    elevation: 2,
  },
  balanceContainer: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#757575',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  quickActions: {
    // Apply consistent styling with accountSummary
    backgroundColor: '#FFFFFF',
    paddingVertical: 16, // Keep vertical padding
    // paddingHorizontal handled by sectionTitle and actionButtonsContainer
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
   actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16, // Add horizontal padding here
  },
  actionButton: {
    alignItems: 'center',
     padding: 8, // Add padding for touchable area
  },
  actionButtonLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#333', // Darker text
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  accountNumber: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Removed recentTransactions styles if handled by component
  // Removed transaction styles if handled by component
  // REMOVED bottomNav, navItem, navLabel styles
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  noAccountsText: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 16,
    marginTop: 20,
  },
});


export default Home;