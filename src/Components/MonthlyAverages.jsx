import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.6; // Reduced from 0.7 to 0.6 for more subtle cards

const MonthlyAverages = () => {
  const [averages, setAverages] = useState({
    income: 0,
    expenses: 0,
    savings: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();

  useEffect(() => {
    fetchMonthlyAverages();
  }, []);

  const fetchMonthlyAverages = async () => {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1).toISOString());

      if (error) throw error;

      // Calculate averages for the last 6 months
      const monthlyData = {};
      transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expenses: 0, count: 0 };
        }

        if (transaction.amount > 0) {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expenses += Math.abs(transaction.amount);
        }
        monthlyData[monthKey].count++;
      });

      // Calculate averages
      const months = Object.keys(monthlyData).length;
      if (months > 0) {
        const totalIncome = Object.values(monthlyData).reduce((sum, month) => sum + month.income, 0);
        const totalExpenses = Object.values(monthlyData).reduce((sum, month) => sum + month.expenses, 0);
        
        setAverages({
          income: totalIncome / months,
          expenses: totalExpenses / months,
          savings: (totalIncome - totalExpenses) / months
        });
      }
    } catch (error) {
      console.error('Error fetching monthly averages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JMD'
    }).format(amount);
  };

  const renderCard = (icon, title, amount, color, style) => (
    <View style={[styles.card, style, { width: CARD_WIDTH }]}>
      <Icon name={icon} size={24} color={color} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.amount, { color }]}>
        {formatCurrency(amount)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Averages</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 12}
        snapToAlignment="center"
        contentContainerStyle={styles.cardsContainer}
      >
        {renderCard('trending-up', 'Income', averages.income, '#4CAF50', styles.incomeCard)}
        {renderCard('trending-down', 'Expenses', averages.expenses, '#E74C3C', styles.expenseCard)}
        {renderCard('account-balance', 'Savings', averages.savings, '#3498DB', styles.savingsCard)}
        {/* Add more cards here in the future */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#666',
  },
  cardsContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  incomeCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  expenseCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#E74C3C',
  },
  savingsCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#3498DB',
  },
  cardTitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    marginBottom: 6,
    fontWeight: '400',
  },
  amount: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
});

export default MonthlyAverages; 