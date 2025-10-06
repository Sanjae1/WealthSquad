import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radii } from '../../DesignSystem/theme';
import PrimaryButton from '../../Components/BillsUi/PrimaryButton';
import InputField from '../../Components/BillsUi/InputField';
import { getBillerById } from '../../Data/billers';

const PaymentDetailsScreen = ({ route, navigation }) => {
  const { billerId } = route.params || {};
  const biller = getBillerById(billerId);

  const amountDue = 15450;
  const [amount, setAmount] = useState(String(amountDue.toFixed(2)));
  const [method, setMethod] = useState('My NCB Visa Debit (...4321)');
  const total = useMemo(() => parseFloat(amount || '0'), [amount]);

  const onConfirm = () => {
    navigation.navigate('Confirmation', {
      amount: total,
      billerId,
      method,
      reference: Math.floor(Math.random() * 1_000_000_000),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerText}>{`Pay ${biller?.shortName}`}</Text></View>
      <View style={styles.content}>
        <Text style={styles.label}>Amount Due</Text>
        <Text style={styles.value}>$15,450.00</Text>
        <Text style={[styles.label, { marginTop: spacing.xs }]}>Due Date</Text>
        <Text style={styles.value}>October 20, 2023</Text>

        <View style={{ height: spacing.lg }} />
        <InputField
          label="Payment Amount"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <TouchableOpacity style={styles.quickBtn} onPress={() => setAmount(String(amountDue.toFixed(2)))}>
          <Text style={styles.quickBtnText}>Pay Full Amount</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.lg }} />
        <Text style={styles.label}>Pay with</Text>
        <TouchableOpacity style={styles.selector}>
          <Text style={styles.selectorText}>{method}</Text>
          <Text style={styles.selectorArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity><Text style={styles.addNew}>Add new card/bank</Text></TouchableOpacity>

        <View style={{ height: spacing.lg }} />
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Amount</Text><Text style={styles.summaryValue}>${total.toFixed(2)}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Fee</Text><Text style={styles.summaryValue}>$0.00</Text></View>
        <View style={styles.separator} />
        <View style={styles.summaryRow}><Text style={styles.summaryTotal}>Total</Text><Text style={styles.summaryTotal}>${total.toFixed(2)}</Text></View>

        <View style={{ height: spacing.xl }} />
        <PrimaryButton title="Slide to Confirm Payment" onPress={onConfirm} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: spacing.xxl, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1 },
  headerText: { fontSize: typography.heading1, color: colors.text, fontFamily: typography.headingFamily },
  content: { padding: spacing.xl },
  label: { color: colors.mutedText, fontSize: typography.small },
  value: { color: colors.text, fontSize: typography.body, marginBottom: spacing.xs },
  quickBtn: { alignSelf: 'flex-start', backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, marginTop: spacing.xs },
  quickBtnText: { color: colors.primaryBlue },
  selector: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.xs, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectorText: { color: colors.text },
  selectorArrow: { color: colors.mutedText },
  addNew: { color: colors.primaryBlue, marginTop: spacing.xs },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.xs },
  summaryLabel: { color: colors.mutedText },
  summaryValue: { color: colors.text },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  summaryTotal: { color: colors.text, fontFamily: typography.headingFamily },
});

export default PaymentDetailsScreen;

