import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useBiometrics } from '../hooks/useBiometrics';
import { MyColours } from '../Utils/MyColours';

const Security = () => {
  const navigation = useNavigation();
  const {
    available: biometricsAvailable,
    enabled: biometricsEnabled,
    type: biometricType,
    loading,
    enableBiometrics,
    disableBiometrics,
    testBiometrics
  } = useBiometrics();

  const toggleBiometrics = async (value) => {
    if (value) {
      // Enable biometrics
      const result = await enableBiometrics();
      if (result.success) {
        Alert.alert('Success', `${biometricType} has been enabled for app authentication.`);
      } else {
        Alert.alert('Authentication Failed', result.error || 'Please try again to enable biometric authentication.');
      }
    } else {
      // Disable biometrics
      Alert.alert(
        'Disable Biometrics',
        'Are you sure you want to disable biometric authentication?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              const result = await disableBiometrics();
              if (result.success) {
                Alert.alert('Success', 'Biometric authentication has been disabled.');
              } else {
                Alert.alert('Error', result.error || 'Failed to disable biometric authentication.');
              }
            },
          },
        ]
      );
    }
  };

  const handleTestBiometrics = async () => {
    const result = await testBiometrics();
    if (result.success) {
      Alert.alert('Success', `${biometricType} authentication test passed!`);
    } else {
      Alert.alert('Test Failed', result.error || 'Biometric authentication test failed. Please try again.');
    }
  };

  const securityOptions = [
    {
      id: 'biometrics',
      label: 'Biometric Authentication',
      subtitle: biometricsAvailable ? `Use ${biometricType} to unlock the app` : 'Biometric authentication not available',
      icon: biometricType === 'Face ID' ? 'face' : 'fingerprint',
      type: 'switch',
      value: biometricsEnabled,
      onValueChange: toggleBiometrics,
      disabled: !biometricsAvailable,
    },
    {
      id: 'testBiometrics',
      label: 'Test Biometric Authentication',
      subtitle: 'Test your biometric authentication',
      icon: 'security',
      type: 'button',
      onPress: handleTestBiometrics,
      disabled: !biometricsAvailable || !biometricsEnabled,
    },
    {
      id: 'changePassword',
      label: 'Change Password',
      subtitle: 'Update your account password',
      icon: 'lock',
      type: 'button',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      id: 'twoFactor',
      label: 'Two-Factor Authentication',
      subtitle: 'Add an extra layer of security',
      icon: 'verified-user',
      type: 'button',
      onPress: () => navigation.navigate('TwoFactorAuth'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={MyColours.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.settingsContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading security settings...</Text>
          </View>
        ) : (
          securityOptions.map((option) => (
            <View key={option.id} style={styles.settingsItem}>
              <View style={styles.settingsItemContent}>
                <Icon 
                  name={option.icon} 
                  size={24} 
                  color={option.disabled ? "#BDBDBD" : MyColours.primary} 
                />
                <View style={styles.textContainer}>
                  <Text style={[
                    styles.settingsItemLabel,
                    option.disabled && styles.disabledText
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.settingsItemSubtitle,
                    option.disabled && styles.disabledText
                  ]}>
                    {option.subtitle}
                  </Text>
                </View>
              </View>
              
              {option.type === 'switch' ? (
                <Switch
                  value={option.value}
                  onValueChange={option.onValueChange}
                  disabled={option.disabled}
                  trackColor={{ false: '#E0E0E0', true: MyColours.primary }}
                  thumbColor={option.disabled ? '#BDBDBD' : '#FFFFFF'}
                />
              ) : (
                <TouchableOpacity
                  onPress={option.onPress}
                  disabled={option.disabled}
                  style={option.disabled ? styles.disabledButton : null}
                >
                  <Icon 
                    name="chevron-right" 
                    size={24} 
                    color={option.disabled ? "#BDBDBD" : "#757575"} 
                  />
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyColours.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: MyColours.secondary,
    borderBottomWidth: 1,
    borderBottomColor: MyColours.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MyColours.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  settingsContainer: {
    flex: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: MyColours.background,
    borderBottomWidth: 1,
    borderBottomColor: MyColours.border,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingsItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: MyColours.textPrimary,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: MyColours.textSecondary,
    marginTop: 2,
  },
  disabledText: {
    color: '#BDBDBD',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: MyColours.textSecondary,
  },
});

export default Security;
