import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MyColours } from '../Utils/MyColours'; // Assuming your colors are defined here
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../supabaseClient';

// A helper component for our styled form fields
const FormField = ({ label, icon, error, children, isFocused }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused, error && styles.inputContainerError]}>
      <Ionicons name={icon} size={20} color={MyColours.grey} style={styles.inputIcon} />
      {children}
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const Signup = () => {
  const nav = useNavigation();
  const [signupCredentials, setSignupCredentials] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [focusedField, setFocusedField] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { firstName, lastName, email, password, confirmPassword } = signupCredentials;

  const handleInputChange = (field, value) => {
    setSignupCredentials({ ...signupCredentials, [field]: value });
    // Clear error for the field being edited
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required.';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) newErrors.email = 'Email is required.';
    else if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email address.';
    
    if (!password) newErrors.password = 'Password is required.';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters long.';
    
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const signUpUser = async () => {
    Keyboard.dismiss();
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) throw error;
  
      if (data?.user) {
        // The insert to a public 'Users' table is often handled by a DB trigger
        // for security and reliability. If you need to do it manually, this is the place.
        Alert.alert(
          'Success!',
          'Please check your email for a verification link to complete your registration.',
          [{ text: 'OK', onPress: () => nav.navigate('Login') }]
        );
      } else {
        Alert.alert('Registration pending', 'Please check your email to verify your account.');
      }
    } catch (error) {
      Alert.alert('Registration Error', error.message || 'An unexpected error occurred.');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexOne}
      >
        <ScrollView 
          style={styles.flexOne}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image 
              style={styles.logo} 
              source={require("../assets/FreshStart_LOGO.png")} 
            />
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Join us to get started
            </Text>
          </View>
          
          <View style={styles.form}>
            {/* First & Last Name Fields */}
            <View style={styles.row}>
              <View style={styles.flexOne}>
                 <FormField label="First Name" icon="person-outline" error={errors.firstName} isFocused={focusedField === 'firstName'}>
                    <TextInput
                      value={firstName}
                      onChangeText={(val) => handleInputChange('firstName', val)}
                      placeholder="John"
                      placeholderTextColor={MyColours.grey}
                      autoCapitalize="words"
                      style={styles.input}
                      onFocus={() => setFocusedField('firstName')}
                      onBlur={() => setFocusedField(null)}
                    />
                 </FormField>
              </View>
              <View style={styles.flexOne}>
                 <FormField label="Last Name" icon="person-outline" error={errors.lastName} isFocused={focusedField === 'lastName'}>
                    <TextInput
                      value={lastName}
                      onChangeText={(val) => handleInputChange('lastName', val)}
                      placeholder="Doe"
                      placeholderTextColor={MyColours.grey}
                      autoCapitalize="words"
                      style={styles.input}
                      onFocus={() => setFocusedField('lastName')}
                      onBlur={() => setFocusedField(null)}
                    />
                 </FormField>
              </View>
            </View>

            {/* Email Field */}
            <FormField label="Email" icon="mail-outline" error={errors.email} isFocused={focusedField === 'email'}>
              <TextInput
                value={email}
                onChangeText={(val) => handleInputChange('email', val)}
                placeholder="you@example.com"
                placeholderTextColor={MyColours.grey}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </FormField>

            {/* Password Field */}
            <FormField label="Password" icon="lock-closed-outline" error={errors.password} isFocused={focusedField === 'password'}>
              <TextInput
                value={password}
                onChangeText={(val) => handleInputChange('password', val)}
                placeholder="Min. 6 characters"
                placeholderTextColor={MyColours.grey}
                secureTextEntry={!isPasswordVisible}
                style={styles.input}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                <Ionicons
                  name={isPasswordVisible ? "eye-off-outline" : 'eye-outline'}
                  size={24}
                  color={MyColours.grey}
                />
              </TouchableOpacity>
            </FormField>

            {/* Confirm Password Field */}
            <FormField label="Confirm Password" icon="lock-closed-outline" error={errors.confirmPassword} isFocused={focusedField === 'confirmPassword'}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={(val) => handleInputChange('confirmPassword', val)}
                  placeholder="Re-enter password"
                  placeholderTextColor={MyColours.grey}
                  secureTextEntry={!isPasswordVisible}
                  style={styles.input}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                />
            </FormField>
            
            <TouchableOpacity 
              onPress={signUpUser}
              disabled={isLoading}
              style={[styles.button, isLoading && styles.buttonDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={MyColours.secondary} />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => nav.navigate('Login')}>
              <Text style={styles.footerLink}> Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Define your color palette if not already done in MyColours
MyColours.primary = MyColours.primary || '#4A90E2';
MyColours.secondary = MyColours.secondary || '#FFFFFF';
MyColours.third = MyColours.third || '#000000';
MyColours.grey = MyColours.grey || '#A9A9A9';
MyColours.lightGrey = MyColours.lightGrey || '#F0F0F0';
MyColours.error = MyColours.error || '#D0021B';

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  container: { 
    flex: 1, 
    backgroundColor: MyColours.secondary,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: MyColours.third,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: MyColours.grey,
  },
  form: {
    width: '100%',
    gap: 15,
  },
  fieldContainer: {
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: MyColours.grey,
    marginBottom: 8,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MyColours.lightGrey,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 15,
  },
  inputContainerFocused: {
    borderColor: MyColours.primary,
    backgroundColor: MyColours.secondary,
  },
  inputContainerError: {
    borderColor: MyColours.error,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: MyColours.third,
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    color: MyColours.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    backgroundColor: MyColours.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: MyColours.grey,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: MyColours.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 15,
    color: MyColours.grey,
  },
  footerLink: {
    fontSize: 15,
    color: MyColours.primary,
    fontWeight: '600',
  },
});

export default Signup;