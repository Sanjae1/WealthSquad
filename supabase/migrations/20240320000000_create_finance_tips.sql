-- Create finance_tips table
CREATE TABLE finance_tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    author VARCHAR(100) NOT NULL,
    image_url TEXT,
    key_points TEXT[] DEFAULT '{}',
    references TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on category for faster filtering
CREATE INDEX idx_finance_tips_category ON finance_tips(category);

-- Create an index on created_at for sorting
CREATE INDEX idx_finance_tips_created_at ON finance_tips(created_at DESC);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_finance_tips_updated_at
    BEFORE UPDATE ON finance_tips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample finance tips
INSERT INTO finance_tips (title, content, category, author, key_points, references) VALUES
(
    'Understanding Emergency Funds: Your Financial Safety Net',
    E'An emergency fund is a crucial component of your financial health. It''s money set aside specifically for unexpected expenses or financial emergencies.\n\nExperts typically recommend having 3-6 months of living expenses saved in an easily accessible account. This fund can help you avoid going into debt when unexpected costs arise, such as medical bills, car repairs, or job loss.\n\nTo build your emergency fund:\n1. Start small with a goal of $1,000\n2. Gradually increase your savings\n3. Keep the money in a separate, easily accessible savings account\n4. Resist the urge to use it for non-emergencies\n5. Replenish it immediately after use',
    'Saving',
    'Financial Planning Team',
    ARRAY[
        'Aim for 3-6 months of living expenses',
        'Keep funds easily accessible',
        'Start with small, achievable goals',
        'Use for true emergencies only',
        'Regular contributions are key'
    ],
    ARRAY[
        'Federal Reserve Board Survey of Consumer Finances',
        'FDIC Emergency Savings Guidelines'
    ]
),
(
    'The Power of Compound Interest in Long-term Investing',
    E'Compound interest is often called the eighth wonder of the world, and for good reason. It''s the process where the interest you earn on your investments generates its own interest over time.\n\nThe key to maximizing compound interest is starting early. Even small regular investments can grow significantly over long periods due to this powerful effect.\n\nFor example, if you invest $200 monthly with an 8% average annual return:\n- After 10 years: ~$35,000\n- After 20 years: ~$118,000\n- After 30 years: ~$300,000\n\nThis demonstrates how time and consistent investing can work in your favor.',
    'Investing',
    'Investment Education Team',
    ARRAY[
        'Start investing early to maximize benefits',
        'Regular contributions amplify growth',
        'Time is your most valuable asset',
        'Even small amounts can grow significantly',
        'Reinvesting returns accelerates growth'
    ],
    ARRAY[
        'SEC Compound Interest Calculator',
        'Historical S&P 500 Returns'
    ]
),
(
    'Smart Budgeting: The 50/30/20 Rule',
    E'The 50/30/20 budgeting rule is a simple but effective way to manage your money. This approach divides your after-tax income into three categories:\n\n50% for Needs:\n- Housing\n- Utilities\n- Food\n- Basic transportation\n- Insurance\n\n30% for Wants:\n- Entertainment\n- Dining out\n- Shopping\n- Hobbies\n- Travel\n\n20% for Savings/Debt:\n- Emergency fund\n- Retirement savings\n- Debt repayment\n- Investments\n\nThis framework provides flexibility while ensuring you''re meeting essential needs and financial goals.',
    'Budgeting',
    'Personal Finance Team',
    ARRAY[
        'Allocate 50% to essential needs',
        'Limit wants to 30% of income',
        'Save or pay debt with 20%',
        'Adjust percentages to your situation',
        'Track spending regularly'
    ],
    ARRAY[
        'Consumer Financial Protection Bureau Guidelines',
        'Harvard Business Review Personal Finance'
    ]
); 