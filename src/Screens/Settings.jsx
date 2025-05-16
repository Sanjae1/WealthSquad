import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const Settings = () => {
  const navigation = useNavigation();
  const supabase = useSupabaseClient();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Reset the navigation state and navigate to Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to log out. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Error logging out:', error.message);
    }
  };

  const settingsOptions = [
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: 'person',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'notifications',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      id: 'security',
      label: 'Security',
      icon: 'security',
      onPress: () => navigation.navigate('Security'),
    },
    {
      id: 'creditReport',
      label: 'Credit Report',
      icon: 'credit-card',
      onPress: () => navigation.navigate('CreditReport'),
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: 'logout',
      onPress: () => {
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Logout',
              onPress: handleLogout,
              style: 'destructive'
            }
          ]
        );
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.settingsContainer}>
        {settingsOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.settingsItem}
            onPress={option.onPress}
          >
            <View style={styles.settingsItemContent}>
              <Icon name={option.icon} size={24} color="#4CAF50" />
              <Text style={styles.settingsItemLabel}>{option.label}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>
        ))}
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
  settingsContainer: {
    flex: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemLabel: {
    fontSize: 16,
    marginLeft: 16,
  },
});

export default Settings; 