import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Custom storage implementation using expo-secure-store
const ExpoSecureStoreAdapter = {
  getItem: (key) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key, value) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Get these values from your Supabase dashboard
const supabaseUrl = 'https://whsuumrsdvncjudaxjva.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3V1bXJzZHZuY2p1ZGF4anZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMTMwNjYsImV4cCI6MjA0NDU4OTA2Nn0.Q7fIO9_B6VezWXmFHxR24w_NaZ9z4MZCdnYU8FgC9HI';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 