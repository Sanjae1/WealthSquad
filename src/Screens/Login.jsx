import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useRef } from 'react';
import { MyColours } from '../Utils/MyColours';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient('https://whsuumrsdvncjudaxjva.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3V1bXJzZHZuY2p1ZGF4anZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMTMwNjYsImV4cCI6MjA0NDU4OTA2Nn0.Q7fIO9_B6VezWXmFHxR24w_NaZ9z4MZCdnYU8FgC9HI');

const Login = () => {
  const nav = useNavigation();
  const scrollViewRef = useRef(null);
  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: ""
  });
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { email, password } = loginCredentials;

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

  const loginUser = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const { user, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      console.log('User logged in:', user);
      nav.navigate('AppMain');
    } catch (error) {
      setErrorMessage(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle input focus and scroll to the focused input
  const handleFocus = (y) => {
    // Add a small delay to ensure the keyboard is fully shown
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: y, animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MyColours.secondary }}>
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

          <View style={{ paddingHorizontal: 24 }}>
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
                <ActivityIndicator color={MyColours.secondary} />
              ) : (
                <Text style={{ 
                  color: MyColours.secondary, 
                  fontSize: 16,
                  fontWeight: '600' 
                }}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginTop: 32 
            }}>
              <Text style={{ 
                color: MyColours.textSecondary,
                fontSize: 14 
              }}>
                Don't have an account?
              </Text>
              <TouchableOpacity 
                onPress={() => nav.navigate('Signup')}
                style={{ marginLeft: 4 }}
              >
                <Text style={{ 
                  color: MyColours.primary, 
                  fontSize: 14,
                  fontWeight: '600' 
                }}>
                  Create Account
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