import { useState, useEffect } from 'react';
import biometricService from '../Services/biometricService';

export const useBiometrics = () => {
  const [biometricStatus, setBiometricStatus] = useState({
    available: false,
    enabled: false,
    type: '',
    loading: true
  });

  useEffect(() => {
    loadBiometricStatus();
  }, []);

  const loadBiometricStatus = async () => {
    try {
      const status = await biometricService.getBiometricStatus();
      setBiometricStatus({
        ...status,
        loading: false
      });
    } catch (error) {
      console.error('Error loading biometric status:', error);
      setBiometricStatus({
        available: false,
        enabled: false,
        type: '',
        loading: false
      });
    }
  };

  const authenticate = async (promptMessage = 'Authenticate to continue') => {
    return await biometricService.authenticate(promptMessage);
  };

  const enableBiometrics = async () => {
    const result = await biometricService.enableBiometrics();
    if (result.success) {
      await loadBiometricStatus(); // Refresh status
    }
    return result;
  };

  const disableBiometrics = async () => {
    const result = await biometricService.disableBiometrics();
    if (result.success) {
      await loadBiometricStatus(); // Refresh status
    }
    return result;
  };

  const testBiometrics = async () => {
    return await biometricService.testBiometrics();
  };

  return {
    ...biometricStatus,
    authenticate,
    enableBiometrics,
    disableBiometrics,
    testBiometrics,
    refreshStatus: loadBiometricStatus
  };
};
