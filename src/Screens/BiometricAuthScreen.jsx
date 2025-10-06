import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { MyColours } from '../Utils/MyColours';
import { Ionicons } from '@expo/vector-icons';

const BiometricAuthScreen = () => {
  const navigation = useNavigation();
  const supabase = useSupabaseClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (!hasHardware || !isEnrolled) {
        // If biometrics are not available, go directly to main app
        navigateToMainApp();
        return;
      }

      // Determine biometric type
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Touch ID');
      } else {
        setBiometricType('Biometric');
      }

      // Check if user has biometric login enabled
      const refreshToken = await SecureStore.getItemAsync('supabase_refresh_token');
      if (!refreshToken) {
        // No stored credentials, go to main app (user hasn't enabled biometrics)
        navigateToMainApp();
        return;
      }

      setIsLoading(false);
      // Automatically trigger biometric authentication
      setTimeout(() => {
        handleBiometricAuth();
      }, 500);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      navigateToMainApp();
    }
  };

  const handleBiometricAuth = async () => {
    try {
      setIsAuthenticating(true);
      setErrorMessage('');

      // Get the stored refresh token
      const refreshToken = await SecureStore.getItemAsync('supabase_refresh_token');
      if (!refreshToken) {
        throw new Error('No stored credentials found');
      }

      // Validate the refresh token format (basic check)
      if (typeof refreshToken !== 'string' || refreshToken.length < 10) {
        await SecureStore.deleteItemAsync('supabase_refresh_token');
        throw new Error('Invalid stored credentials');
      }

      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Unlock ${biometricType}`,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use passcode',
      });

      if (!result.success) {
        if (result.error === 'user_cancel') {
          // User cancelled, show error message
          setErrorMessage('Authentication cancelled');
          return;
        }
        throw new Error('Biometric authentication failed');
      }

      // Try to refresh the session using the stored refresh token
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (sessionError) {
        // If the refresh token is invalid, clear it and ask user to login with password
        if (sessionError.message.includes('invalid refresh token') || 
            sessionError.message.includes('Auth session missing') ||
            sessionError.message.includes('Refresh Token Not Found')) {
          await SecureStore.deleteItemAsync('supabase_refresh_token');
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please login with your password.',
            [
              {
                text: 'OK',
                onPress: () => navigation.replace('Login')
              }
            ]
          );
          return;
        }
        throw sessionError;
      }

      if (!session) {
        throw new Error('No session received');
      }

      // Verify the session by getting the user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        throw new Error('No user data received');
      }

      // Navigate to main app
      navigation.replace('AppMain');
    } catch (error) {
      console.error('Biometric authentication error:', error);
      setErrorMessage(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const navigateToMainApp = () => {
    navigation.replace('AppMain');
  };

  const navigateToLogin = () => {
    navigation.replace('Login');
  };

  const handleRetry = () => {
    setErrorMessage('');
    handleBiometricAuth();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MyColours.primary} />
          <Text style={styles.loadingText}>Checking biometric availability...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Biometric Icon */}
        <View style={styles.iconContainer}>
          <Ionicons 
            name={biometricType === 'Face ID' ? "face-recognition" : "finger-print"} 
            size={80} 
            color={MyColours.primary} 
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Use {biometricType} to unlock your account
        </Text>

        {/* Error Message */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#D32F2F" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isAuthenticating ? (
            <View style={styles.authenticatingContainer}>
              <ActivityIndicator size="small" color={MyColours.primary} />
              <Text style={styles.authenticatingText}>Authenticating...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleBiometricAuth}
                disabled={isAuthenticating}
              >
                <Ionicons 
                  name={biometricType === 'Face ID' ? "face-recognition" : "finger-print"} 
                  size={24} 
                  color="#fff" 
                  style={styles.buttonIcon}
                />
                <Text style={styles.primaryButtonText}>
                  Unlock with {biometricType}
                </Text>
              </TouchableOpacity>

              {errorMessage && (
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={handleRetry}
                >
                  <Text style={styles.secondaryButtonText}>Try Again</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Alternative Options */}
        <View style={styles.alternativeContainer}>
          <TouchableOpacity 
            style={styles.alternativeButton}
            onPress={navigateToLogin}
          >
            <Text style={styles.alternativeButtonText}>
              Use Password Instead
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyColours.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: MyColours.textSecondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: MyColours.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: MyColours.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFECEC',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    maxWidth: '100%',
  },
  errorText: {
    color: '#D32F2F',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: MyColours.primary,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: MyColours.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: MyColours.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  authenticatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  authenticatingText: {
    marginLeft: 8,
    fontSize: 16,
    color: MyColours.textSecondary,
  },
  alternativeContainer: {
    width: '100%',
  },
  alternativeButton: {
    padding: 16,
    alignItems: 'center',
  },
  alternativeButtonText: {
    color: MyColours.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default BiometricAuthScreen;
