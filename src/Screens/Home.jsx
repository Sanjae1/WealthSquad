import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native'; // Import navigation

const Home = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const navigation = useNavigation(); // Hook for navigation

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleLogout = () => {
    // Perform any necessary logout actions (e.g., clearing user data, tokens)
    console.log('User logged out');

    // Hide dropdown
    setDropdownVisible(false);

    // Redirect to the Login screen
    navigation.replace('Login'); // This will replace the current screen with the Login screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hi, User!</Text>

          <View style={styles.dropdownMenu}>
            <TouchableOpacity onPress={toggleDropdown}>
              <Icon name="more-vert" size={24} color="#000" />
            </TouchableOpacity>

            {/* Dropdown Menu */}
            <Modal
              transparent={true}
              visible={isDropdownVisible}
              animationType="fade"
              onRequestClose={toggleDropdown}
            >
              <TouchableOpacity style={styles.modalOverlay} onPress={toggleDropdown}>
                <View style={styles.dropdown}>
                  <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                    <Icon name="logout" size={24} color="#000" />
                    <Text style={styles.dropdownText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        </View>

        {/* Account Summary */}
        <View style={styles.accountSummary}>
          <Text style={styles.sectionTitle}>Account Summary</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>$10,234.56</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtonsContainer}>
            <ActionButton icon="add" label="Add Account" />
            <ActionButton icon="attach-money" label="Budget" />
            <ActionButton icon="trending-up" label="Investments" />
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentTransactions}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Transaction 
            merchant="Grocery Store"
            amount="-$45.67"
            date="Today"
            category="Food"
          />
          <Transaction 
            merchant="Gas Station"
            amount="-$30.00"
            date="Yesterday"
            category="Transportation"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ActionButton = ({ icon, label }) => (
  <View style={styles.actionButton}>
    <Icon name={icon} size={24} color="#4CAF50" />
    <Text style={styles.actionButtonLabel}>{label}</Text>
  </View>
);

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  dropdownMenu: {
    position: 'relative',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 50,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  dropdownText: {
    marginLeft: 8,
    fontSize: 16,
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
});

export default Home;
