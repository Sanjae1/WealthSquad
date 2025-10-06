/**
 * Home Screen Component
 * 
 * The main dashboard screen that users see after logging in. It provides:
 * - Account summary with total balance
 * - List of linked bank accounts
 * - Quick actions for common tasks
 * - Recent transactions overview
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Using MaterialIcons as per original
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import MonthlyAverages from '../Components/MonthlyAverages';

/**
 * Formats a balance value into a currency string
 * @param {number} balance - The balance to format
 * @returns {string} Formatted currency string
 */
const formatBalance = (balance) => {
  if (balance === undefined || balance === null) return '0.00';
  const numBalance = parseFloat(balance);
  if (isNaN(numBalance)) return '0.00';
  return numBalance.toLocaleString('en-US', {
    style: 'currency',
    currency: 'JMD'
  });
};

/**
 * Account Item Component
 * Memoized component for rendering individual account items
 */
const AccountItem = React.memo(({ account, onUnlink, onPress }) => (
  <TouchableOpacity 
    style={styles.accountItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.accountInfo}>
      <Text style={styles.accountName}>{account.account_name || 'Unnamed Account'}</Text>
      <Text style={styles.accountNumber}>
        {account.last_four_digits ? `****${account.last_four_digits}` : 'No account number'}
      </Text>
    </View>
    <View style={styles.accountActions}>
      <Text style={[
        styles.accountBalance,
        { color: (account.balance || 0) >= 0 ? '#4CAF50' : '#E74C3C' }
      ]}>
        {formatBalance(account.balance)}
      </Text>
      <TouchableOpacity 
        onPress={(e) => {
          e.stopPropagation();
          onUnlink(account.id);
        }}
        style={styles.unlinkButton}
      >
        <Icon name="link-off" size={20} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
));

const Home = () => {
  // Navigation and authentication hooks
  const navigation = useNavigation();
  const user = useUser();
  const supabase = useSupabaseClient();

  // State management
  const [accounts, setAccounts] = useState([]);        // List of user's bank accounts
  const [totalBalance, setTotalBalance] = useState(0); // Total balance across all accounts
  const [loading, setLoading] = useState(true);        // Loading state for data fetching
  const [error, setError] = useState(null);           // Error state for better error handling
  const [isRefreshing, setIsRefreshing] = useState(false); // State for pull-to-refresh
  const [isAddAccountSheetVisible, setIsAddAccountSheetVisible] = useState(false);

  /**
   * Fetches user's bank accounts from Supabase
   * Updates accounts list and calculates total balance
   */
  const fetchAccounts = useCallback(async (showLoading = true) => {
    if (!user) {
      console.log('No user found, skipping fetch');
      setLoading(false);
      setError('Authentication required');
      // Redirect to login if no user is found
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      console.log('Starting to fetch accounts for user:', user.id);
      
      // Fetch accounts from Supabase
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase error fetching accounts:', error);
        throw error;
      }

      setAccounts(data || []);
      
      // Calculate total balance across all accounts
      const total = data?.reduce((sum, account) => {
        return sum + (parseFloat(account.balance) || 0);
      }, 0) || 0;
      
      setTotalBalance(total);
    } catch (error) {
      console.error('Error in fetchAccounts:', error);
      setError(error.message || 'Failed to load accounts. Please try again.');
      Alert.alert(
        'Error',
        'Failed to load accounts. Would you like to try again?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Retry',
            onPress: () => fetchAccounts(true)
          }
        ]
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, supabase, navigation]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Home screen focused, user:', user?.id);
      fetchAccounts(true);
    }, [fetchAccounts])
  );

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAccounts(false);
  }, [fetchAccounts]);

  /**
   * Handles user logout
   * Signs out from Supabase and redirects to login screen
   */
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

  // Memoize the accounts list to prevent unnecessary re-renders
  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      // Sort by balance (highest to lowest)
      return (b.balance || 0) - (a.balance || 0);
    });
  }, [accounts]);

  // Memoize the total balance calculation
  const formattedTotalBalance = useMemo(() => {
    return formatBalance(totalBalance);
  }, [totalBalance]);

  // Memoize the account item handlers
  const handleAccountPress = useCallback((account) => {
    navigation.navigate('AccountTransactions', { account });
  }, [navigation]);

  const handleUnlinkAccount = useCallback(async (accountId) => {
    Alert.alert(
      'Unlink Account',
      'Are you sure you want to unlink this account? This will remove all associated transactions.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Delete associated transactions first
              const { error: transactionError } = await supabase
                .from('transactions')
                .delete()
                .eq('bank_account_number', accountId);

              if (transactionError) throw transactionError;

              // Then delete the account
              const { error: accountError } = await supabase
                .from('accounts')
                .delete()
                .eq('id', accountId);

              if (accountError) throw accountError;

              // Refresh the accounts list
              fetchAccounts(false);
            } catch (error) {
              console.error('Error unlinking account:', error);
              Alert.alert('Error', 'Failed to unlink account. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }, [supabase, fetchAccounts]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome, { (`${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim()) || 'User'
  }!</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Icon name="logout" size={24} color="#757575" />
          </TouchableOpacity>
        </View>

        {/* Account Summary Section */}
        <View style={styles.accountSummary}>
          <Text style={styles.sectionTitle}>Account Summary</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading accounts...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={48} color="#E74C3C" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => fetchAccounts(true)}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Total Balance Display */}
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceAmount}>
                  {formattedTotalBalance}
                </Text>
              </View>
              
              {/* List of Bank Accounts */}
              {sortedAccounts.length > 0 ? (
                sortedAccounts.map((account) => (
                  <AccountItem
                    key={account.id} 
                    account={account}
                    onUnlink={handleUnlinkAccount}
                    onPress={() => navigation.navigate('AccountTransactions', { account })}
                  />
                ))
              ) : (
                <Text style={styles.noAccountsText}>No accounts added yet</Text>
              )}
            </>
          )}
        </View>

        {/* Monthly Averages Section */}
        <MonthlyAverages />

        {/* Quick Actions Section */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity onPress={() => setIsAddAccountSheetVisible(true)}>
              <ActionButton icon="add" label="Add Account" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('BudgetTab')}>
              <ActionButton icon="attach-money" label="Budget" />
            </TouchableOpacity>
            <ActionButton icon="trending-up" label="Investments" />
          </View>
        </View>
      </ScrollView>

      {/* Add Account Bottom Sheet */}
      <Modal
        animationType="slide"
        transparent
        visible={isAddAccountSheetVisible}
        onRequestClose={() => setIsAddAccountSheetVisible(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setIsAddAccountSheetVisible(false)}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add Account</Text>
            <TouchableOpacity
              style={styles.sheetAction}
              onPress={() => {
                setIsAddAccountSheetVisible(false);
                navigation.navigate('SelectBankScreen');
              }}
            >
              <Icon name="account-balance" size={24} color="#4CAF50" />
              <Text style={styles.sheetActionText}>Add Bank</Text>
              <Icon name="chevron-right" size={24} color="#9E9E9E" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetAction}
              onPress={() => {
                setIsAddAccountSheetVisible(false);
                navigation.navigate('CardDetails');
              }}
            >
              <Icon name="credit-card" size={24} color="#4CAF50" />
              <Text style={styles.sheetActionText}>Add Card</Text>
              <Icon name="chevron-right" size={24} color="#9E9E9E" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

/**
 * Quick Action Button Component
 * Renders a circular button with an icon and label
 */
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
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  sheetActionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333333',
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
  accountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unlinkButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
  },
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
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Home;