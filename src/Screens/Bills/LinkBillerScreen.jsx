import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, spacing, typography } from '../../DesignSystem/theme';
import InputField from '../../Components/BillsUi/InputField';
import PrimaryButton from '../../Components/BillsUi/PrimaryButton';
import { getBillerById } from '../../Data/billers';

const LinkBillerScreen = ({ route, navigation }) => {
  const { billerId } = route.params || {};
  const biller = getBillerById(billerId);

  const [accountNumber, setAccountNumber] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const linkAccount = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('PaymentDetails', { billerId });
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerText}>Link Your Account</Text></View>
      <View style={styles.content}>
        {!!biller?.logo && <Image source={biller.logo} style={{ width: 64, height: 64, marginBottom: spacing.md }} />}
        <Text style={styles.billerName}>{biller?.shortName}</Text>

        <InputField
          label="Account Number"
          placeholder={`Enter your ${biller?.shortName} account number`}
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="number-pad"
          helpText="You can find this on the top-right of your bill."
        />

        <InputField
          label="Account Nickname (Optional)"
          placeholder="e.g., Home Electricity"
          value={nickname}
          onChangeText={setNickname}
        />

        <PrimaryButton title="Link Account" onPress={linkAccount} loading={loading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: spacing.xxl, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1 },
  headerText: { fontSize: typography.heading1, color: colors.text, fontFamily: typography.headingFamily },
  content: { padding: spacing.xl },
  billerName: { color: colors.text, fontSize: typography.heading2, marginBottom: spacing.md },
});

export default LinkBillerScreen;

