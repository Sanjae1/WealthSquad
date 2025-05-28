/**
 * Login Screen Component
 * 
 * Handles user authentication with the following features:
 * - Email and password validation
 * - Secure password input with visibility toggle
 * - Error handling and display
 * - Keyboard-aware scrolling
 * - Navigation to forgot password and signup
 */

import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useRef } from 'react';
import { MyColours } from '../Utils/MyColours';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const Login = () => {
  // Navigation and Supabase client hooks
  const nav = useNavigation();
  const supabase = useSupabaseClient();
  
  // Refs for scroll view control
  const scrollViewRef = useRef(null);

  // State management
  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: ""
  });
  const [isVisible, setIsVisible] = useState(true);      // Password visibility toggle
  const [isLoading, setIsLoading] = useState(false);     // Loading state during login
  const [errorMessage, setErrorMessage] = useState("");  // Error message display
  const { email, password } = loginCredentials;

  /**
   * Validates the login form inputs
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please fill in all fields");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }
    return true;
  };

  /**
   * Handles the login process
   * Authenticates user with Supabase and navigates to main app on success
   */
  const loginUser = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      if (!data?.user) {
        throw new Error('No user data received');
      }
      
      // Navigate to main app screen
      nav.reset({
        index: 0,
        routes: [{ name: 'AppMain' }],
      });
    } catch (error) {
      let errorMsg = "Login failed. Please try again.";
      
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        errorMsg = "Invalid email or password";
      } else if (error.message.includes('Email not confirmed')) {
        errorMsg = "Please verify your email address first";
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles input focus and scrolls to the focused input
   * @param {number} y - The y-coordinate to scroll to
   */
  const handleFocus = (y) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: y, animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MyColours.secondary }}>
      {/* Keyboard-aware container */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={{ 
            flexGrow: 1, 
            paddingBottom: 40,
            paddingTop: Platform.OS === 'ios' ? 0 : 20 
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={{ 
            alignItems: 'center', 
            paddingVertical: Platform.OS === 'ios' ? 40 : 20 
          }}>
            <Image 
              style={{ 
                width: 140, 
                height: 140, 
                resizeMode: 'contain' 
              }} 
              source={require("../assets/FreshStart_LOGO.png")} 
            />
          </View>

          {/* Login Form Section */}
          <View style={{ paddingHorizontal: 24 }}>
            {/* Welcome Text */}
            <Text style={{ 
              color: MyColours.primary, 
              fontSize: 28, 
              fontWeight: '700', 
              marginBottom: 8 
            }}>
              Welcome Back
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: MyColours.textSecondary,
              marginBottom: 30 
            }}>
              Sign in to continue your journey
            </Text>

            {/* Error Message Display */}
            {errorMessage ? (
              <View style={{ 
                backgroundColor: '#FFECEC', 
                padding: 16, 
                borderRadius: 8, 
                marginBottom: 24,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Ionicons name="alert-circle" size={20} color="#D32F2F" />
                <Text style={{ 
                  color: '#D32F2F', 
                  marginLeft: 8,
                  flex: 1 
                }}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ 
                fontSize: 14, 
                color: MyColours.textPrimary,
                marginBottom: 8 
              }}>
                Email Address
              </Text>
              <TextInput
                value={email}
                onChangeText={(val) => setLoginCredentials({ ...loginCredentials, email: val })}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter your email"
                placeholderTextColor={MyColours.textSecondary}
                style={{ 
                  backgroundColor: MyColours.background,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: MyColours.border,
                }}
                onFocus={() => handleFocus(150)}
              />
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ 
                fontSize: 14, 
                color: MyColours.textPrimary,
                marginBottom: 8 
              }}>
                Password
              </Text>
              <View style={{ 
                backgroundColor: MyColours.background,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: MyColours.border,
                flexDirection: 'row', 
                alignItems: 'center',
                paddingRight: 16
              }}>
                <TextInput
                  value={password}
                  onChangeText={(val) => setLoginCredentials({ ...loginCredentials, password: val })}
                  secureTextEntry={isVisible}
                  placeholder="Enter your password"
                  placeholderTextColor={MyColours.textSecondary}
                  style={{ 
                    flex: 1,
                    fontSize: 16,
                    padding: 16,
                  }}
                  onFocus={() => handleFocus(250)}
                />
                {/* Password Visibility Toggle */}
                <TouchableOpacity
                  onPress={() => setIsVisible(!isVisible)}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Ionicons
                    name={isVisible ? "eye-off-outline" : 'eye-outline'}
                    size={24}
                    color={MyColours.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity 
              onPress={() => nav.navigate('ForgotPassword')}
              style={{ alignSelf: 'flex-end', marginBottom: 32 }}
            >
              <Text style={{ 
                color: MyColours.primary, 
                fontSize: 14,
                fontWeight: '500' 
              }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                loginUser();
              }}
              disabled={isLoading}
              style={{ 
                backgroundColor: MyColours.primary,
                borderRadius: 12,
                padding: 20,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ 
                  color: '#fff', 
                  fontSize: 16,
                  fontWeight: '600' 
                }}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'center', 
              marginTop: 24 
            }}>
              <Text style={{ 
                color: MyColours.textSecondary,
                fontSize: 14 
              }}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => nav.navigate('Signup')}>
                <Text style={{ 
                  color: MyColours.primary,
                  fontSize: 14,
                  fontWeight: '600' 
                }}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;