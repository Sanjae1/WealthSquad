import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

class BiometricService {
  constructor() {
    this.biometricType = '';
    this.isAvailable = false;
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async checkBiometricAvailability() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (hasHardware && isEnrolled) {
        this.isAvailable = true;
        
        // Determine biometric type
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          this.biometricType = 'Face ID';
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          this.biometricType = 'Touch ID';
        } else {
          this.biometricType = 'Biometric';
        }

        return {
          available: true,
          type: this.biometricType,
          supportedTypes
        };
      } else {
        this.isAvailable = false;
        return {
          available: false,
          type: '',
          supportedTypes: []
        };
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      this.isAvailable = false;
      return {
        available: false,
        type: '',
        supportedTypes: [],
        error: error.message
      };
    }
  }

  /**
   * Get current biometric settings from storage
   */
  async loadBiometricSettings() {
    try {
      const enabled = await AsyncStorage.getItem('biometricsEnabled');
      return {
        enabled: enabled === 'true',
        type: this.biometricType
      };
    } catch (error) {
      console.error('Error loading biometric settings:', error);
      return {
        enabled: false,
        type: this.biometricType
      };
    }
  }

  /**
   * Save biometric settings to storage
   */
  async saveBiometricSettings(enabled) {
    try {
      await AsyncStorage.setItem('biometricsEnabled', enabled.toString());
      return { success: true };
    } catch (error) {
      console.error('Error saving biometric settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticate(promptMessage = 'Authenticate to continue') {
    try {
      if (!this.isAvailable) {
        throw new Error('Biometric authentication not available');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!result.success) {
        if (result.error === 'user_cancel') {
          return { success: false, cancelled: true };
        }
        throw new Error('Biometric authentication failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enable biometric authentication for the user
   */
  async enableBiometrics() {
    try {
      // First authenticate to ensure user is authorized
      const authResult = await this.authenticate(`Enable ${this.biometricType}`);
      
      if (!authResult.success) {
        return { success: false, error: authResult.error || 'Authentication failed' };
      }

      // Save the setting
      const saveResult = await this.saveBiometricSettings(true);
      if (!saveResult.success) {
        return saveResult;
      }

      return { success: true };
    } catch (error) {
      console.error('Error enabling biometrics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometrics() {
    try {
      const result = await this.saveBiometricSettings(false);
      return result;
    } catch (error) {
      console.error('Error disabling biometrics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test biometric authentication
   */
  async testBiometrics() {
    try {
      if (!this.isAvailable) {
        return { success: false, error: 'Biometric authentication not available' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Test ${this.biometricType}`,
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!result.success) {
        if (result.error === 'user_cancel') {
          return { success: false, cancelled: true };
        }
        return { success: false, error: 'Test failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error testing biometrics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get comprehensive biometric status
   */
  async getBiometricStatus() {
    try {
      const availability = await this.checkBiometricAvailability();
      const settings = await this.loadBiometricSettings();
      
      return {
        available: availability.available,
        enabled: settings.enabled,
        type: availability.type,
        loading: false
      };
    } catch (error) {
      console.error('Error getting biometric status:', error);
      return {
        available: false,
        enabled: false,
        type: '',
        loading: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export default new BiometricService();
