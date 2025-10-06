import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FeatureItem = ({ title, points }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {points.map((p, idx) => (
      <View key={idx} style={styles.bulletRow}>
        <Text style={styles.bullet}>{'\u2022'}</Text>
        <Text style={styles.point}>{p}</Text>
      </View>
    ))}
  </View>
);

const Features = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Features</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.intro}>
          WealthSquad helps you manage money smarter: track accounts and transactions, learn practical finance tips, and plan with calculators.
        </Text>

        <FeatureItem
          title="Accounts and Transactions"
          points={[
            'Add bank accounts and view balances',
            'See recent and historical transactions',
            'Monthly averages overview',
          ]}
        />

        <FeatureItem
          title="Education"
          points={[
            'Browse finance tips',
            'Read detailed guidance for each topic',
          ]}
        />

        <FeatureItem
          title="Calculators"
          points={[
            'Mortgage, Car Loan, Debt, Student Loan',
            'Grocery and Travel budgeting',
            'Buy vs Rent comparison',
          ]}
        />

        <FeatureItem
          title="Budgeting"
          points={['Plan spending with the Budget Planner']}
        />

        <FeatureItem
          title="Security"
          points={[
            'Biometric unlock (Face/Touch ID) on supported devices',
            'Manage security preferences',
          ]}
        />

        <FeatureItem
          title="Extras"
          points={[
            'Request a credit report',
            'Demo bank connection flows',
          ]}
        />

        <Text style={styles.footer}>Powered by Supabase for authentication and data.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  intro: {
    fontSize: 16,
    color: '#374151',
    padding: 16,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    width: 16,
    color: '#4B5563',
  },
  point: {
    flex: 1,
    color: '#111827',
    lineHeight: 20,
  },
  footer: {
    textAlign: 'center',
    color: '#6B7280',
    marginVertical: 16,
  },
});

export default Features;



