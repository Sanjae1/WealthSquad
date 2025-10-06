import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography, radii } from '../../DesignSystem/theme';
import PrimaryButton from '../../Components/BillsUi/PrimaryButton';
import { getBillerById } from '../../Data/billers';

const ConfirmationScreen = ({ route, navigation }) => {
  const { amount, billerId, method, reference } = route.params || {};
  const biller = getBillerById(billerId);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="check-circle" size={72} color={colors.success} />
      </View>
      <Text style={styles.title}>Payment Submitted!</Text>
      <Text style={styles.body}>{`Your payment of $${Number(amount).toFixed(2)} to ${biller?.shortName} has been submitted. It may take 1-3 business days to reflect on your account.`}</Text>

      <View style={styles.details}>
        <Text style={styles.row}><Text style={styles.label}>Reference #:</Text> {reference}</Text>
        <Text style={styles.row}><Text style={styles.label}>Paid To:</Text> {biller?.shortName}</Text>
        <Text style={styles.row}><Text style={styles.label}>Paid From:</Text> {method}</Text>
      </View>

      <View style={{ height: spacing.lg }} />
      <PrimaryButton title="Done" onPress={() => navigation.popToTop()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { backgroundColor: colors.white, width: 120, height: 120, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: typography.heading2, fontFamily: typography.headingFamily, marginBottom: spacing.sm },
  body: { color: colors.mutedText, textAlign: 'center' },
  details: { marginTop: spacing.xl, backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: spacing.lg, alignSelf: 'stretch' },
  row: { color: colors.text, marginBottom: spacing.xs },
  label: { fontFamily: typography.headingFamily, color: colors.text },
});

export default ConfirmationScreen;

