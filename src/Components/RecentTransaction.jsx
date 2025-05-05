// src/components/RecentTransactions.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { supabase } from '../../supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Category icon mapping
  const getCategoryIcon = (category) => {
    const icons = {
      food: 'restaurant',
      transportation: 'directions-car',
      housing: 'home',
      entertainment: 'movie',
      shopping: 'shopping-cart',
      utilities: 'flash-on',
      healthcare: 'local-hospital',
      salary: 'attach-money'
    };
    return icons[category.toLowerCase()] || 'receipt';
  };

  // Date formatting function
  const formatDate = (dateString) => {
    const today = new Date();
    const transactionDate = new Date(dateString);
    
    if (transactionDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (transactionDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return transactionDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Currency formatting
  const formatCurrency = (amount, type) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
    
    return type === 'expense' ? `-${formatted}` : formatted;
  };

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false })
          .limit(10);

        if (error) throw error;
        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Render individual transaction item
  const renderItem = ({ item }) => (
    <View style={styles.transactionContainer}>
      <View style={styles.iconContainer}>
        <Icon
          name={getCategoryIcon(item.category)}
          size={24}
          color={item.type === 'expense' ? '#e74c3c' : '#2ecc71'}
        />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.merchant} numberOfLines={1}>
          {item.description || 'Unknown Merchant'}
        </Text>
        <Text style={styles.category}>
          {item.category} • {formatDate(item.date)}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={[
          styles.amount,
          { color: item.type === 'expense' ? '#e74c3c' : '#2ecc71' }
        ]}>
          {formatCurrency(item.amount, item.type)}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>Error loading transactions</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      
      {transactions.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2d3436',
  },
  transactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: '#f5f6fa',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  detailsContainer: {
    flex: 2,
  },
  merchant: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3436',
  },
  category: {
    fontSize: 12,
    color: '#636e72',
    marginTop: 4,
  },
  amountContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  error: {
    color: '#e74c3c',
    fontSize: 14,
  },
  emptyText: {
    color: '#636e72',
    fontSize: 14,
  },
});

export default RecentTransactions;