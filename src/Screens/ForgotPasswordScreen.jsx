import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useRef } from 'react';
import { MyColours } from '../Utils/MyColours';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const ForgotPasswordScreen = () => {
  const nav = useNavigation();
  const supabase = useSupabaseClient();
  const scrollViewRef = useRef(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = () => {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;
    
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'wealthsquad://reset-password',
      });

      if (error) throw error;

      setSuccessMessage("Password reset instructions have been sent to your email");
      setEmail("");
    } catch (error) {
      console.error('Reset password error:', error);
      setErrorMessage("Failed to send reset instructions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocus = (y) => {
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
              Reset Password
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: MyColours.textSecondary,
              marginBottom: 30 
            }}>
              Enter your email to receive reset instructions
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

            {successMessage ? (
              <View style={{ 
                backgroundColor: '#E8F5E9', 
                padding: 16, 
                borderRadius: 8, 
                marginBottom: 24,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                <Text style={{ 
                  color: '#2E7D32', 
                  marginLeft: 8,
                  flex: 1 
                }}>
                  {successMessage}
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
                onChangeText={setEmail}
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

            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                handleResetPassword();
              }}
              disabled={isLoading}
              style={{ 
                backgroundColor: MyColours.primary,
                borderRadius: 12,
                padding: 20,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading ? 0.7 : 1,
                marginBottom: 16
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ 
                  color: 'white', 
                  fontSize: 16,
                  fontWeight: '600' 
                }}>
                  Send Reset Instructions
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => nav.goBack()}
              style={{ 
                padding: 20,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{ 
                color: MyColours.primary, 
                fontSize: 16,
                fontWeight: '500' 
              }}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
