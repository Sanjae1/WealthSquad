import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../DesignSystem/theme';
import BillerCard from '../../Components/BillsUi/BillerCard';
import FloatingActionButton from '../../Components/BillsUi/FloatingActionButton';
import { BILLERS, POPULAR_BILLERS } from '../../Data/billers';

const BillPayDashboard = ({ navigation }) => {
  const upcoming = [
    { id: 'jps', title: 'JPS - Electricity', subtitle: '$15,450.00 due in 3 days' },
    { id: 'flow', title: 'Flow - Internet', subtitle: '$4,500.00 due on Oct 25th' },
  ];

  const linked = [
    { id: 'nwc', title: 'NWC - Water', subtitle: 'Account ending in ...1234' },
    { id: 'ncb', title: 'NCB - Credit Card', subtitle: 'Account ending in ...5678' },
  ];

  const goToAdd = () => navigation.navigate('AddBiller');
  const goToPay = (billerId) => navigation.navigate('PaymentDetails', { billerId });

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerText}>My Bills</Text></View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>Upcoming Bills</Text>
        {upcoming.map(item => (
          <BillerCard
            key={item.id}
            logoSource={BILLERS.find(b => b.id === item.id)?.logo}
            title={item.title}
            subtitle={item.subtitle}
            rightCtaLabel="Pay Now"
            onPress={() => goToPay(item.id)}
          />
        ))}

        <Text style={[styles.section, { marginTop: spacing.xl }]}>Linked Bills</Text>
        {linked.map(item => (
          <BillerCard
            key={item.id}
            logoSource={BILLERS.find(b => b.id === item.id)?.logo}
            title={item.title}
            subtitle={item.subtitle}
            rightCtaLabel="View / Pay"
            onPress={() => goToPay(item.id)}
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
      <FloatingActionButton onPress={goToAdd} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: spacing.xxl, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1 },
  headerText: { fontSize: typography.heading1, color: colors.text, fontFamily: typography.headingFamily },
  content: { padding: spacing.xl },
  section: { color: colors.mutedText, fontSize: typography.small, marginBottom: spacing.sm },
});

export default BillPayDashboard;

