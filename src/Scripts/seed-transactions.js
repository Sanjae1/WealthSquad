// scripts/seed-transactions.js
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

const generateMockData = (numEntries = 100) => {
  return Array.from({ length: numEntries }).map(() => ({
    user_id: faker.string.uuid(), // For testing, use real user IDs in prod
    date: faker.date.between({ 
      from: '2024-01-01', 
      to: '2024-03-31' 
    }).toISOString().split('T')[0],
    description: faker.finance.transactionDescription(),
    amount: parseFloat(faker.finance.amount({
      min: -1000,
      max: 5000,
      dec: 2
    })),
    category: faker.helpers.arrayElement([
      'Groceries', 'Rent', 'Utilities', 
      'Entertainment', 'Transport', 'Healthcare'
    ]),
    bank_account_number: `BANK-${faker.finance.accountNumber(10)}`
  }));
};

const seedDatabase = async () => {
  const transactions = generateMockData(150);
  
  const { data, error } = await supabase
    .from('transactions')
    .insert(transactions)
    .select();

  if (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }

  console.log(`Successfully inserted ${data.length} transactions`);
  process.exit(0);
};

seedDatabase();