import { View, Text, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { MyColours } from '../Utils/MyColours';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const Splash = () => {
  const nav = useNavigation();
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

    // Navigation timeout
    const timer = setTimeout(() => {
      nav.replace("Login");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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