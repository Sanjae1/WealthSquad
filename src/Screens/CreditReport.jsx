import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Button, StyleSheet } from 'react-native';

const CreditReportRequestForm = () => {
  const [form, setForm] = useState({
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    trn: '',
    dob: '',
    placeOfBirth: '',
    currentAddress: '',
    town: '',
    parish: '',
    phone: '',
    email: '',
    reportType: '',
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = () => {
    console.log('Submitted Form:', form);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Consumer Credit Report Request Form</Text>
      
      <Text style={styles.label}>First Name</Text>
      <TextInput style={styles.input} value={form.firstName} onChangeText={(text) => handleChange('firstName', text)} />
      
      <Text style={styles.label}>Surname</Text>
      <TextInput style={styles.input} value={form.lastName} onChangeText={(text) => handleChange('lastName', text)} />
      
      <Text style={styles.label}>Tax Registration Number (TRN)</Text>
      <TextInput style={styles.input} value={form.trn} onChangeText={(text) => handleChange('trn', text)} />
      
      <Text style={styles.label}>Date of Birth (DD/MM/YYYY)</Text>
      <TextInput style={styles.input} value={form.dob} onChangeText={(text) => handleChange('dob', text)} />
      
      <Text style={styles.label}>Place of Birth (Parish)</Text>
      <TextInput style={styles.input} value={form.placeOfBirth} onChangeText={(text) => handleChange('placeOfBirth', text)} />
      
      <Text style={styles.label}>Type of Credit Report</Text>
      <TextInput style={styles.input} value={form.reportType} onChangeText={(text) => handleChange('reportType', text)} />
      
      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
});

export default CreditReportRequestForm;
