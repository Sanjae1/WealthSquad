import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { MyColours } from '../Utils/MyColours';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient('https://whsuumrsdvncjudaxjva.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3V1bXJzZHZuY2p1ZGF4anZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMTMwNjYsImV4cCI6MjA0NDU4OTA2Nn0.Q7fIO9_B6VezWXmFHxR24w_NaZ9z4MZCdnYU8FgC9HI');

const Login = () => {
  const nav = useNavigation();
  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: ""
  });
  const [isVisible, setIsVisible] = useState(true);
  const { email, password } = loginCredentials;

  const loginUser = async () => {
    try {
      const { user, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // Handle successful login (e.g., navigate to another screen)
      console.log('User logged in:', user);
      // Navigate to your desired screen here
       nav.navigate ('Home');
    } catch (error) {
      console.error('Error logging in:', error.message);
      // Handle login error (e.g., show an error message to the user)
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MyColours.secondary }}>
      <ScrollView style={{ flex: 1, paddingTop: 30 }}>
        <Image style={{ backgroundColor: "red", alignSelf: "center" }} source={require("../assets/Freshlogo.png")} />
        <View style={{ paddingHorizontal: 20, marginTop: 1 }}>
          <Text style={{ color: MyColours.third, fontSize: 24, fontWeight: "500" }}>Login</Text>
          <Text style={{ fontSize: 16, fontWeight: "400", color: 'grey', marginTop: 20 }}>Enter your email and password</Text>
          <Text style={{ fontSize: 16, fontWeight: "500", color: "grey", marginTop: 40 }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={(val) => setLoginCredentials({ ...loginCredentials, email: val })}
            keyboardType="email-address"
            style={{ borderColor: '#E3E3E3', borderBottomWidth: 2, fontSize: 16, marginTop: 10 }}
          />
          <Text style={{ fontSize: 16, fontWeight: "500", color: "grey", marginTop: 20 }}>Password</Text>
          <View style={{ borderColor: '#E3E3E3', borderBottomWidth: 2, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <TextInput
              value={password}
              onChangeText={(val) => setLoginCredentials({ ...loginCredentials, password: val })}
              secureTextEntry={isVisible}
              maxLength={13}
              keyboardType="ascii-capable"
              style={{ flex: 0.9, fontSize: 17, marginTop: 15 }}
            />
            <Ionicons
              onPress={() => setIsVisible(!isVisible)}
              name={isVisible ? "eye-off-outline" : 'eye-outline'}
              size={24}
              color="black"
            />
          </View>
          <Text style={{ fontSize: 14, fontWeight: '400', color: 'black', marginTop: 15, textAlign: 'right' }}>
            Forgot Password?
          </Text>
          <TouchableOpacity onPress={loginUser} style={{ backgroundColor: MyColours.primary, marginTop: 30, height: 70, borderRadius: 60, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, color: MyColours.secondary }}>Login</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <Text style={{ fontSize: 16 }}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => nav.navigate('Signup')}>
              <Text style={{ fontSize: 16, color: MyColours.primary, fontWeight: "600" }}> Sign Up Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;