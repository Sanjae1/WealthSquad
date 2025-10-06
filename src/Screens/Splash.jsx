import { View, Text, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { MyColours } from '../Utils/MyColours';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import sessionService from '../Services/sessionService';

const { width, height } = Dimensions.get('window');

const Splash = () => {
  const nav = useNavigation();
  const supabase = useSupabaseClient();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 2,
        useNativeDriver: true,
      })
    ]).start();

    // Check authentication and biometric status
    checkAuthAndNavigate();
  }, []);

  const checkAuthAndNavigate = async () => {
    try {
      // First, try to restore session from storage
      const { success: sessionRestored, session } = await sessionService.restoreSession();
      
      if (sessionRestored && session) {
        // Session restored successfully, check for biometric authentication
        const refreshToken = await SecureStore.getItemAsync('supabase_refresh_token');
        
        // If user has enabled biometric login, show biometric auth screen
        if (refreshToken) {
          // Navigate to biometric authentication screen
          setTimeout(() => {
            nav.replace("BiometricAuth");
          }, 2000);
        } else {
          // Navigate directly to main app
          setTimeout(() => {
            nav.replace("AppMain");
          }, 2000);
        }
      } else {
        // No valid session found, go to login
        setTimeout(() => {
          nav.replace("Login");
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      // On error, go to login screen
      setTimeout(() => {
        nav.replace("Login");
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style='light' />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image 
          style={styles.logo} 
          source={require('../assets/FreshStart_Splash.png')} 
          resizeMode="contain"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>FreshStart</Text>
          <Text style={styles.subtitle}>Your Daily Companion</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyColours.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    maxWidth: '80%',
  },
  logo: {
    height: height * 0.15,
    width: width * 0.3,
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: width < 400 ? 50 : 60,
    color: MyColours.secondary,
    fontWeight: '700',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: MyColours.secondary,
    fontSize: width < 400 ? 14 : 16,
    letterSpacing: 3,
    marginTop: 5,
    opacity: 0.9,
  },
});

export default Splash;