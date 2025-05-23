import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useRef } from 'react';
import { MyColours } from '../Utils/MyColours';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../supabaseClient';

const Signup = () => {
  const nav = useNavigation();
  const scrollViewRef = useRef(null);
  const [signupCredentials, setSignupCredentials] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { firstName, lastName, email, password, confirmPassword } = signupCredentials;

  const handleFocus = (yPosition) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: yPosition,
        animated: true
      });
    }
  };

  const validateInputs = () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const insertUserData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('Users')
        .insert([
          { 
            user_id: userId,
            email: email,
            first_name: firstName,
            last_name: lastName,
            created_at: new Date().toISOString(),
            // Add any additional user data fields you need
          }
        ]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error inserting user data:', error);
      throw error;
    }
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
            signed_up_at: new Date().toISOString(),
          }
        }
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('not authorized')) {
          Alert.alert(
            'Error',
            'Email signup is not enabled. Please contact support.'
          );
        } else if (error.message.includes('already registered')) {
          Alert.alert(
            'Error',
            'This email is already registered. Please try logging in.'
          );
        } else {
          Alert.alert('Error', error.message);
        }
        console.error('Signup error:', error.message);
        return;
      }
  
      if (data?.user) {
        try {
          await insertUserData(data.user.id);
          Alert.alert(
            'Success',
            'Registration successful! Please check your email for verification.',
            [{ text: 'OK', onPress: () => nav.navigate('Login') }]
          );
        } catch (dbError) {
          console.error('Database error:', dbError);
          Alert.alert(
            'Warning',
            'Account created but there was an error saving additional data.'
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MyColours.secondary }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={{ flex: 1, paddingTop: 20 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Image style={{ alignSelf: "center", width: 2, aspectRatio: 140, height: 140, resizeMode:'contain' }} source={require("../assets/FreshStart_LOGO.png")} />
          <View style={{ paddingHorizontal: 20, marginTop: 1 }}>
            <Text style={{ color: MyColours.third, fontSize: 24, fontWeight: "500" }}>Sign Up</Text>
            <Text style={{ fontSize: 16, fontWeight: "400", color: 'grey', marginTop: 15, marginBottom: 10 }}>
              Enter your details to create an account
            </Text>

            {/* First Name Field */}
            <Text style={{ fontSize: 16, fontWeight: "500", color: "grey", marginTop: 20 }}>First Name</Text>
            <TextInput
              value={firstName}
              onChangeText={(val) => setSignupCredentials({ ...signupCredentials, firstName: val })}
              autoCapitalize="words"
              style={{ borderColor: '#E3E3E3', borderBottomWidth: 2, fontSize: 16, marginTop: 10, paddingBottom: 8 }}
              onFocus={() => handleFocus(150)}
            />

            {/* Last Name Field */}
            <Text style={{ fontSize: 16, fontWeight: "500", color: "grey", marginTop: 20 }}>Last Name</Text>
            <TextInput
              value={lastName}
              onChangeText={(val) => setSignupCredentials({ ...signupCredentials, lastName: val })}
              autoCapitalize="words"
              style={{ borderColor: '#E3E3E3', borderBottomWidth: 2, fontSize: 16, marginTop: 10, paddingBottom: 8 }}
              onFocus={() => handleFocus(230)}
            />

            {/* Email Field */}
            <Text style={{ fontSize: 16, fontWeight: "500", color: "grey", marginTop: 20 }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(val) => setSignupCredentials({ ...signupCredentials, email: val })}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ borderColor: '#E3E3E3', borderBottomWidth: 2, fontSize: 16, marginTop: 10, paddingBottom: 8 }}
              onFocus={() => handleFocus(310)}
            />

            {/* Password Field */}
            <Text style={{ fontSize: 16, fontWeight: "500", color: "grey", marginTop: 20 }}>Password</Text>
            <View style={{ borderColor: '#E3E3E3', borderBottomWidth: 2, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <TextInput
                value={password}
                onChangeText={(val) => setSignupCredentials({ ...signupCredentials, password: val })}
                secureTextEntry={isVisible}
                maxLength={13}
                keyboardType="ascii-capable"
                style={{ flex: 0.9, fontSize: 17, marginTop: 10, paddingBottom: 8 }}
                onFocus={() => handleFocus(390)}
              />
              <Ionicons
                onPress={() => setIsVisible(!isVisible)}
                name={isVisible ? "eye-off-outline" : 'eye-outline'}
                size={24}
                color="black"
              />
            </View>

            {/* Confirm Password Field */}
            <Text style={{ fontSize: 16, fontWeight: "500", color: "grey", marginTop: 20 }}>Confirm Password</Text>
            <View style={{ borderColor: '#E3E3E3', borderBottomWidth: 2, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <TextInput
                value={confirmPassword}
                onChangeText={(val) => setSignupCredentials({ ...signupCredentials, confirmPassword: val })}
                secureTextEntry={isVisible}
                maxLength={13}
                keyboardType="ascii-capable"
                style={{ flex: 0.9, fontSize: 17, marginTop: 10, paddingBottom: 8 }}
                onFocus={() => handleFocus(470)}
              />
            </View>

            <TouchableOpacity 
              onPress={signUpUser}
              disabled={isLoading}
              style={{ 
                backgroundColor: isLoading ? MyColours.grey : MyColours.primary,
                marginTop: 30,
                height: 60,
                borderRadius: 60,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ fontSize: 20, color: MyColours.secondary }}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
              <Text style={{ fontSize: 16 }}>Already have an account?</Text>
              <TouchableOpacity onPress={() => nav.navigate('Login')}>
                <Text style={{ fontSize: 16, color: MyColours.primary, fontWeight: "600" }}> Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;