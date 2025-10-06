import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom storage implementation using AsyncStorage
const AsyncStorageAdapter = {
  getItem: (key) => {
    return AsyncStorage.getItem(key);
  },
  setItem: (key, value) => {
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key) => {
    return AsyncStorage.removeItem(key);
  },
};

// Get these values from your Supabase dashboard
const supabaseUrl = 'https://whsuumrsdvncjudaxjva.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3V1bXJzZHZuY2p1ZGF4anZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMTMwNjYsImV4cCI6MjA0NDU4OTA2Nn0.Q7fIO9_B6VezWXmFHxR24w_NaZ9z4MZCdnYU8FgC9HI';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 