import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

const CardDetailsScreen = () => {
  const navigation = useNavigation();
  const user = useUser();
  const supabase = useSupabaseClient();

  const [cardNickname, setCardNickname] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [issuer, setIssuer] = useState('');
  const [currency, setCurrency] = useState('JMD');
  const [saving, setSaving] = useState(false);

  const formatExpiry = (value) => {
    const v = value.replace(/[^0-9]/g, '').slice(0, 4);
    if (v.length <= 2) return v;
    return v.slice(0, 2) + '/' + v.slice(2);
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    const sanitizedNumber = cardNumber.replace(/\s+/g, '');
    if (sanitizedNumber.length < 12 || sanitizedNumber.length > 19) {
      Alert.alert('Invalid Card', 'Please enter a valid card number.');
      return;
    }
    if (!/^[0-9]{2}\/[0-9]{2}$/.test(expiry)) {
      Alert.alert('Invalid Expiry', 'Use MM/YY format.');
      return;
    }
    if (!/^[0-9]{3,4}$/.test(cvv)) {
      Alert.alert('Invalid CVV', 'Enter a 3 or 4 digit CVV.');
      return;
    }

    const lastFour = sanitizedNumber.slice(-4);

    try {
      setSaving(true);
      const { error } = await supabase
        .from('accounts')
        .insert({
          account_name: cardNickname || `${issuer || 'Credit Card'} ****${lastFour}`,
          institution_name: issuer || 'Card',
          initial_balance: 0,
          balance: 0,
          last_four_digits: lastFour,
          account_type: 'credit_card',
          currency,
          user_id: user.id,
        });

      if (error) throw error;

      Alert.alert('Success', 'Card added successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add card.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Card</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Card Nickname</Text>
        <TextInput
          style={styles.input}
          value={cardNickname}
          onChangeText={setCardNickname}
          placeholder="e.g., Scotia Visa"
        />

        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          value={cardNumber}
          onChangeText={(t) => setCardNumber(t.replace(/[^0-9 ]/g, ''))}
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Expiry (MM/YY)</Text>
            <TextInput
              style={styles.input}
              value={expiry}
              onChangeText={(t) => setExpiry(formatExpiry(t))}
              placeholder="MM/YY"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <View style={styles.spacer} />
          <View style={styles.col}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              value={cvv}
              onChangeText={(t) => setCvv(t.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="123"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        <Text style={styles.label}>Issuer</Text>
        <TextInput
          style={styles.input}
          value={issuer}
          onChangeText={setIssuer}
          placeholder="e.g., Scotiabank"
        />

        <Text style={styles.hint}>We never store full PAN or CVV. Only last 4 for display.</Text>

        <TouchableOpacity style={[styles.button, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Card'}</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  col: {
    flex: 1,
  },
  spacer: {
    width: 12,
  },
  hint: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CardDetailsScreen;


