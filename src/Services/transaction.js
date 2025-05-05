import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
 'https://whsuumrsdvncjudaxjva.supabase.co',
 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3V1bXJzZHZuY2p1ZGF4anZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMTMwNjYsImV4cCI6MjA0NDU4OTA2Nn0.Q7fIO9_B6VezWXmFHxR24w_NaZ9z4MZCdnYU8FgC9HI'
);

export const TransactionsService = {
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  getByCategory: async (userId, category) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category);

    if (error) throw new Error(error.message);
    return data;
  },

  getCategories: async (userId) => {
    const { data } = await supabase
      .from('transactions')
      .select('category')
      .eq('user_id', userId);

    return [...new Set(data.map(item => item.category))];
  }
};