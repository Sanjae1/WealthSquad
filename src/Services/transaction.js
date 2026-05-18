import { supabase } from './supabaseClient';

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
