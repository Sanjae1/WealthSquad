import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Using MaterialIcons as per original
import { useNavigation } from '@react-navigation/native';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import RecentTransactions from '../Components/RecentTransaction'; // Corrected path assuming Components folder

const Home = () => {
  const navigation = useNavigation();
  const user = useUser();
  const supabase = useSupabaseClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Navigate back to Login in the main stack
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
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>$10,234.56</Text>
          </View>
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
  // Removed recentTransactions styles if handled by component
  // Removed transaction styles if handled by component
  // REMOVED bottomNav, navItem, navLabel styles
});


export default Home;