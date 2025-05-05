// utils/dummyData.js

/**
 * Generates a random date string (YYYY-MM-DD) within the last N months.
 * @param {number} months - How many months back to potentially go (e.g., 5 for up to 5 months ago).
 * @returns {string} - Date string in YYYY-MM-DD format.
 */
const getRandomDateLastNMonths = (months = 5) => {
    const end = new Date();
    const start = new Date();
    // Set start date back by N months
    start.setMonth(start.getMonth() - months);
    // Get random time between start and end
    const randomTimestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    const randomDate = new Date(randomTimestamp);
  
    // Format date as YYYY-MM-DD
    const year = randomDate.getFullYear();
    const month = String(randomDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(randomDate.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  };
  
  // Sample Merchants/Descriptions relevant to Jamaica
  const merchants = [
    'MegaMart Groceries', 'Hi-Lo Food Store', 'PriceSmart Wholesale',
    'Total Gas Station', 'RUBiS Energy', 'Texaco Service Station',
    'Tastee Patties', 'Island Grill', 'Juici Patties', 'KFC Jamaica',
    'Devon House Bakery', 'Cafe Blue', 'Starbucks',
    'Amazon Online', 'eBay Purchase', 'Local Online Store',
    'Digicel Top-Up', 'Flow Bill Payment', 'JPS Bill Payment', 'NWC Water Bill',
    'Pharmacy Plus', 'Fontana Pharmacy', 'Medical Associates',
    'Kingston Cinema', 'Carib 5 Theatre',
    'Book Merchant Ltd', 'Sangster\'s Book Store',
    'Hardware & Lumber', 'Rapid True Value',
    'Online Subscription Service', 'Music Streaming Fee', 'Gym Membership',
    'ATM Withdrawal - NCB', 'ATM Withdrawal - Scotia', 'ATM Withdrawal - JN',
    'Salary Deposit - Company XYZ', 'Client Payment Received', 'Transfer from Friend',
    'Uber Ride', 'Knutsford Express', 'JUTC Bus Fare',
  ];
  
  /**
   * Generates an array of realistic sample transactions.
   * @param {number} count - Approximate number of transactions to generate.
   * @param {number} monthsHistory - How many months back the transaction dates should span.
   * @param {boolean} isCreditCard - Affects transaction types/amounts slightly.
   * @param {boolean} includeSalary - Whether to likely include a salary deposit.
   * @returns {Array<object>} - Array of transaction objects.
   */
  const generateTransactions = (count = 20, monthsHistory = 5, isCreditCard = false, includeSalary = true) => {
    let transactions = [];
    let addedSalary = !includeSalary || isCreditCard; // Assume salary added if not required or it's a CC
  
    for (let i = 0; i < count; i++) {
      const isIncome = !isCreditCard && Math.random() < 0.1; // Less likely income for non-CC
      const amount = Math.round((Math.random() * (isIncome ? 60000 : 18000) + (isIncome ? 20000 : 300)) * 100) / 100; // Random amount logic
  
      let description = merchants[Math.floor(Math.random() * merchants.length)];
      let category = 'General'; // Default category
  
      // Assign more specific descriptions/categories
      if (isIncome) {
          description = Math.random() < 0.7 ? 'Salary Deposit - Company XYZ' : 'Client Payment Received';
          category = 'Income';
          addedSalary = true;
      } else if (description.includes('Groceries') || description.includes('Store') || description.includes('Wholesale')) {
          category = 'Groceries';
      } else if (description.includes('Gas') || description.includes('Energy') || description.includes('Service Station')) {
          category = 'Transportation';
      } else if (description.includes('Patties') || description.includes('Grill') || description.includes('Cafe') || description.includes('Bakery') || description.includes('KFC') || description.includes('Starbucks')) {
          category = 'Food & Dining';
      } else if (description.includes('Bill Payment') || description.includes('JPS') || description.includes('NWC') || description.includes('Digicel') || description.includes('Flow')) {
          category = 'Bills & Utilities';
      } else if (description.includes('Pharmacy') || description.includes('Medical')) {
          category = 'Health & Wellness';
      } else if (description.includes('ATM Withdrawal')) {
          category = 'Cash Withdrawal';
      } else if (description.includes('Online') || description.includes('Subscription')) {
          category = 'Shopping';
      } else if (description.includes('Cinema') || description.includes('Theatre')) {
           category = 'Entertainment';
      }
  
  
      transactions.push({
        date: getRandomDateLastNMonths(monthsHistory),
        description: description,
        amount: isIncome ? amount : -amount, // Negative for expenses
        category: category,
        currency_code: 'JMD',
      });
    }
  
    // Ensure salary is present if required for non-credit card accounts
    if (!addedSalary) {
       transactions.push({
             date: getRandomDateLastNMonths(monthsHistory),
             description: 'Salary Deposit - Company XYZ',
             amount: Math.round((Math.random() * 100000 + 60000) * 100) / 100, // Typical salary range
             category: 'Income',
             currency_code: 'JMD',
        });
    }
  
    // Sort transactions by date, most recent first
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };
  
  
  // --- Main Dummy Data Object ---
  export const dummyBankData = {
    // --- NCB Jamaica ---
    'ncb': [
      {
        id: 'ncb_chek_1234', // Unique dummy ID
        bank_name: 'NCB Jamaica',
        account_name: 'NCB Chequing Plus',
        account_type: 'checking',
        mask: '1234',
        current_balance: 7850.25,
        currency_code: 'JMD',
        transactions: generateTransactions(35, 5, false, true), // ~35 transactions, 5 months history, include salary
      },
      {
        id: 'ncb_sav_5678',
        bank_name: 'NCB Jamaica',
        account_name: 'NCB Regular Save',
        account_type: 'savings',
        mask: '5678',
        current_balance: 45200.80,
        currency_code: 'JMD',
        transactions: generateTransactions(15, 4, false, false), // ~15 transactions, 4 months history, no salary needed
      },
      {
        id: 'ncb_cc_9012',
        bank_name: 'NCB Jamaica',
        account_name: 'NCB Visa Classic',
        account_type: 'credit_card',
        mask: '9012',
        current_balance: -4890.00, // Negative balance typical for credit card
        currency_code: 'JMD',
        transactions: generateTransactions(25, 5, true), // ~25 transactions, 5 months history, is credit card
      },
    ],
  
    // --- Scotia Jamaica ---
    'scotia': [
      {
        id: 'scotia_chek_1111',
        bank_name: 'Scotia Jamaica',
        account_name: 'Scotia Premium Chequing',
        account_type: 'checking',
        mask: '1111',
        current_balance: 11500.50,
        currency_code: 'JMD',
        transactions: generateTransactions(40, 5, false, true), // More active account
      },
      {
        id: 'scotia_cc_2222',
        bank_name: 'Scotia Jamaica',
        account_name: 'Scotia Gold MasterCard',
        account_type: 'credit_card',
        mask: '2222',
        current_balance: -9720.75,
        currency_code: 'JMD',
        transactions: generateTransactions(30, 5, true),
      },
       {
        id: 'scotia_sav_3333',
        bank_name: 'Scotia Jamaica',
        account_name: 'Scotia eSaver Account',
        account_type: 'savings',
        mask: '3333',
        current_balance: 85000.00,
        currency_code: 'JMD',
        transactions: generateTransactions(10, 3, false, false), // Less frequent transactions, 3 month history
      },
    ],
  
    // --- JN Bank ---
    'jn': [
      {
        id: 'jn_chek_4444',
        bank_name: 'JN Bank',
        account_name: 'JN Chequing Direct',
        account_type: 'checking',
        mask: '4444',
        current_balance: 6200.00,
        currency_code: 'JMD',
        transactions: generateTransactions(30, 4, false, true), // 4 months history
      },
      {
        id: 'jn_sav_5555',
        bank_name: 'JN Bank',
        account_name: 'JN Goal Saver',
        account_type: 'savings',
        mask: '5555',
        current_balance: 150500.90,
        currency_code: 'JMD',
        transactions: generateTransactions(12, 5, false, false), // Savings, maybe longer but fewer transactions
      }
      // Add a JN Credit Card if desired
      // {
      //   id: 'jn_cc_6666',
      //   bank_name: 'JN Bank',
      //   account_name: 'JN Visa Credit Card',
      //   account_type: 'credit_card',
      //   mask: '6666',
      //   current_balance: -2500.00,
      //   currency_code: 'JMD',
      //   transactions: generateTransactions(20, 4, true),
      // },
    ],
  
     // --- CIBC FirstCaribbean ---
    'cibc': [
      {
        id: 'cibc_chek_7777',
        bank_name: 'CIBC FirstCaribbean',
        account_name: 'CIBC Smart Chequing',
        account_type: 'checking',
        mask: '7777',
        current_balance: 9876.54,
        currency_code: 'JMD',
        transactions: generateTransactions(38, 5, false, true),
      },
      {
        id: 'cibc_cc_8888',
        bank_name: 'CIBC FirstCaribbean',
        account_name: 'CIBC Rewards Visa',
        account_type: 'credit_card',
        mask: '8888',
        current_balance: -6300.20,
        currency_code: 'JMD',
        transactions: generateTransactions(28, 5, true),
      },
       // Add a CIBC Savings Account if desired
      // {
      //   id: 'cibc_sav_9999',
      //   bank_name: 'CIBC FirstCaribbean',
      //   account_name: 'CIBC Bonus Savings',
      //   account_type: 'savings',
      //   mask: '9999',
      //   current_balance: 32000.00,
      //   currency_code: 'JMD',
      //   transactions: generateTransactions(14, 4, false, false),
      // },
    ],
  };