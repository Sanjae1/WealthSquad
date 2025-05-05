// screens/FakeLoginScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image, // Import Image
  Alert, // Import Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // For icons

// Function to get logo based on bankId - requires logos in assets
const getBankLogo = (bankId) => {
  switch (bankId) {
    case 'ncb': return require('../assets/Logos/Ncb-Logo.jpg');
    case 'scotia': return require('../assets/Logos/Scotia-Logo.png');
    case 'jn': return require('../assets/Logos/JN-Logo.png');
    case 'cibc': return require('../assets/Logos/CIBC-Logo.png');
    default: return null; // Return null or a default placeholder logo
  }
}

const FakeLoginScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bankName, bankId } = route.params; // Get bank details passed from previous screen

  const [username, setUsername] = useState('testuser'); // Pre-fill for demo
  const [password, setPassword] = useState('password'); // Pre-fill for demo
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFakeLogin = () => {
    setIsLoading(true);
    console.log(`Simulating login for ${bankName}...`);

    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login simulation successful.");
      // Navigate to the account selection screen, passing bank details again
      navigation.navigate('SelectFakeAccountsScreen', { bankName, bankId });
    }, 1500); // 1.5 second delay
  };

  const bankLogo = getBankLogo(bankId); // Get the logo based on ID

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {bankLogo && <Image source={bankLogo} style={styles.logo} resizeMode="contain" />}
        <Text style={styles.title}>Sign in to {bankName}</Text>
        <Text style={styles.subtitle}>(Simulation Only)</Text>

        <View style={styles.inputContainer}>
           <Icon name="person-outline" size={20} color="#888" style={styles.inputIcon} />
           <TextInput
            style={styles.input}
            placeholder="Username or ID"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            keyboardType="email-address" // Common type
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.passwordInput]} // Add specific style if needed
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword} // Control visibility
            placeholderTextColor="#aaa"
          />
           <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Icon name={showPassword ? "visibility-off" : "visibility"} size={22} color="#888" />
           </TouchableOpacity>
        </View>


        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleFakeLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Alert.alert('Simulation', 'Forgot password link is not functional in this demo.')}>
          <Text style={styles.forgotText}>Forgot Username/Password?</Text>
        </TouchableOpacity>

         <Text style={styles.disclaimer}>
            This is a simulated login screen for demonstration purposes only.
            Do not enter real banking credentials.
         </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#E74C3C', // Red color for simulation warning
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0', // Light grey background for input
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
     width: '100%', // Make container take full width
  },
  inputIcon: {
      marginRight: 10,
  },
  input: {
    flex: 1, // Input takes remaining space
    height: 50, // Standard input height
    fontSize: 16,
    color: '#333',
  },
   passwordInput: {
    // No specific style needed here unless different from username input
  },
  eyeIcon: {
      padding: 5, // Make icon easier to tap
  },
  loginButton: {
    backgroundColor: '#4CAF50', // Green button
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    width: '100%', // Make button take full width
     shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  loginButtonDisabled: {
    backgroundColor: '#A5D6A7', // Lighter green when disabled
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotText: {
    color: '#4CAF50', // Green color for link
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
  },
   disclaimer: {
      marginTop: 30,
      fontSize: 12,
      color: '#757575',
      textAlign: 'center',
      paddingHorizontal: 20,
   }
});

export default FakeLoginScreen;