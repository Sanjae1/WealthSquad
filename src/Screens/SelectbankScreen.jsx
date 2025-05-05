// Screens/SelectBankScreen.jsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // For back button

// Assume you have logo assets locally or URIs
const banks = [
  { id: 'ncb', name: 'NCB Jamaica', logo: require('../assets/Logos/Ncb-Logo.jpg') },
  { id: 'cibc', name: 'CIBC FirstCaribbean (Jamaica)', logo: require('../assets/Logos/CIBC-Logo.png') },
  { id: 'scotia', name: 'Scotiabank Jamaica', logo: require('../assets/Logos/Scotia-Logo.png') },
  { id: 'jn', name: 'Jamaica National Bank', logo: require('../assets/Logos/JN-Logo.png') },
  // Add others if needed
];

const SelectBankScreen = () => {
  const navigation = useNavigation();

  const handleBankSelect = (bank) => {
    // Navigate to the next step, passing the selected bank info
    navigation.navigate('FakeLoginScreen', { selectedBank: bank });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <Icon name="arrow-back" size={24} color="#333" />
         </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Your Bank</Text>
         <View style={{ width: 24 }} /> {/* Spacer */}
      </View>
      <ScrollView style={styles.listContainer}>
        {banks.map((bank) => (
          <TouchableOpacity
            key={bank.id}
            style={styles.bankItem}
            onPress={() => handleBankSelect(bank)}
          >
            <Image source={bank.logo} style={styles.bankLogo} resizeMode="contain" />
            <Text style={styles.bankName}>{bank.name}</Text>
            <Icon name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
   backButton: {
    padding: 5, // Easier tap target
    marginRight: 15,
  },
  headerTitle: {
    flex: 1, // Allows title to center itself if back button exists
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  bankLogo: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  bankName: {
    flex: 1,
    fontSize: 16,
  },
});

export default SelectBankScreen;