import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import RecentTransactions from '../Components/RecentTransaction';

const Home = () => {
  // Get navigation object for screen transitions
  const navigation = useNavigation();
  
  // Get current authenticated user from Supabase
  const user = useUser();
  
  // Get Supabase client for auth operations
  const supabase = useSupabaseClient();

  // Handle user logout
  const handleLogout = async () => {
    try {
      // Call Supabase signOut method
      await supabase.auth.signOut();
      
      // Reset navigation stack to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Main scrollable content area */}
      <ScrollView style={styles.scrollView}>
        {/* Header section with welcome message */}
        <View style={styles.header}>
          {/* Display user's name from Supabase metadata if available */}
          <Text style={styles.headerTitle}>Welcome, {user?.user_metadata?.full_name || 'User'}!</Text>
        </View>

        {/* Account Summary section */}
        <View style={styles.accountSummary}>
          <Text style={styles.sectionTitle}>Account Summary</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>$10,234.56</Text>
          </View>
        </View>

        {/* Quick Actions section */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtonsContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('AddAccountScreen')}>
            <ActionButton icon="add" label="Add Account" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('BudgetPlanner')}>
            <ActionButton icon="attach-money" label="Budget" />  
            </TouchableOpacity>
            <ActionButton icon="trending-up" label="Investments" />
          </View>
        </View>

        {/* Recent Transactions section */}
      <RecentTransactions />
      </ScrollView>

      {/* 
  // Fixed Bottom Navigation Bar 
  <View style={styles.bottomNav}>
    // Home navigation button 
    <TouchableOpacity 
      style={styles.navItem} 
      onPress={() => navigation.navigate('Home')}
    >
      <Icon name="home" size={24} color="#4CAF50" />
      <Text style={styles.navLabel}>Home</Text>
    </TouchableOpacity>
    
    // Calculators navigation button 
    <TouchableOpacity 
      style={styles.navItem} 
      onPress={() => navigation.navigate('Calculators')}
    >
      <Icon name="calculate" size={24} color="#757575" />
      <Text style={styles.navLabel}>Calculators</Text>
    </TouchableOpacity>

    // Expenses navigation button 
    <TouchableOpacity 
      style={styles.navItem} 
      onPress={() => navigation.navigate('Expenses')}
    >
      <Icon name="account-balance-wallet" size={24} color="#757575" />
      <Text style={styles.navLabel}>Expenses</Text>
    </TouchableOpacity>

    // Menu navigation button 
    <TouchableOpacity 
      style={styles.navItem} 
      onPress={() => navigation.navigate('Menu')}
    >
      <Icon name="menu" size={24} color="#757575" />
      <Text style={styles.navLabel}>Menu</Text>
    </TouchableOpacity>
  </View>
*/}
    </SafeAreaView>
  );
};

// Action button component for quick actions section
const ActionButton = ({ icon, label }) => (
  <View style={styles.actionButton}>
    <Icon name={icon} size={24} color="#4CAF50" />
    <Text style={styles.actionButtonLabel}>{label}</Text>
  </View>
);

// Transaction component for displaying recent transactions
const Transaction = ({ merchant, amount, date, category }) => (
  <View style={styles.transaction}>
    <View style={styles.transactionIcon}>
      <Icon name="shopping-cart" size={24} color="#4CAF50" />
    </View>
    <View style={styles.transactionDetails}>
      <Text style={styles.transactionMerchant}>{merchant}</Text>
      <Text style={styles.transactionCategory}>{category}</Text>
    </View>
    <View style={styles.transactionAmount}>
      <Text style={styles.transactionAmountText}>{amount}</Text>
      <Text style={styles.transactionDate}>{date}</Text>
    </View>
  </View>
);

// Styles for all components
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
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  accountSummary: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonLabel: {
    marginTop: 4,
    fontSize: 12,
  },
  recentTransactions: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionMerchant: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#757575',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 12,
    color: '#757575',
  },
  // Bottom navigation styles
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#757575',
  },
});

export default Home;