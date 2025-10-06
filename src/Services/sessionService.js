import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';

class SessionService {
  constructor() {
    this.SESSION_KEY = 'supabase_session';
    this.REFRESH_TOKEN_KEY = 'supabase_refresh_token';
  }

  /**
   * Store the complete session data
   */
  async storeSession(session) {
    try {
      if (!session) {
        throw new Error('No session to store');
      }

      // Store the complete session object
      await SecureStore.setItemAsync(this.SESSION_KEY, JSON.stringify(session));
      
      // Also store refresh token separately for biometric auth
      if (session.refresh_token) {
        await SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, session.refresh_token);
      }

      return { success: true };
    } catch (error) {
      console.error('Error storing session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retrieve the stored session
   */
  async getStoredSession() {
    try {
      const sessionData = await SecureStore.getItemAsync(this.SESSION_KEY);
      if (!sessionData) {
        return { success: false, session: null };
      }

      const session = JSON.parse(sessionData);
      return { success: true, session };
    } catch (error) {
      console.error('Error retrieving session:', error);
      return { success: false, session: null, error: error.message };
    }
  }

  /**
   * Restore session to Supabase
   */
  async restoreSession() {
    try {
      const { success, session } = await this.getStoredSession();
      
      if (!success || !session) {
        return { success: false, session: null };
      }

      // Set the session in Supabase
      const { data, error } = await supabase.auth.setSession(session);
      
      if (error) {
        console.error('Error restoring session:', error);
        // If session is invalid, clear it
        await this.clearSession();
        return { success: false, session: null, error: error.message };
      }

      return { success: true, session: data.session };
    } catch (error) {
      console.error('Error restoring session:', error);
      return { success: false, session: null, error: error.message };
    }
  }

  /**
   * Clear all stored session data
   */
  async clearSession() {
    try {
      await SecureStore.deleteItemAsync(this.SESSION_KEY);
      await SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY);
      return { success: true };
    } catch (error) {
      console.error('Error clearing session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user has a valid stored session
   */
  async hasValidSession() {
    try {
      const { success, session } = await this.getStoredSession();
      return success && session && session.access_token;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  }

  /**
   * Get stored refresh token for biometric auth
   */
  async getRefreshToken() {
    try {
      const refreshToken = await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
      return refreshToken;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new SessionService();

