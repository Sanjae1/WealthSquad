// scripts/seed-transactions.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');

const supabase = createClient(
  'https://whsuumrsdvncjudaxjva.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3V1bXJzZHZuY2p1ZGF4anZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMTMwNjYsImV4cCI6MjA0NDU4OTA2Nn0.Q7fIO9_B6VezWXmFHxR24w_NaZ9z4MZCdnYU8FgC9HI'
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