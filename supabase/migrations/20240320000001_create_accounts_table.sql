-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    initial_balance DECIMAL(15,2) DEFAULT 0.00,
    last_four_digits VARCHAR(4),
    account_type VARCHAR(50) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_account_type ON accounts(account_type);

-- Enable Row Level Security
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read only their own accounts
CREATE POLICY "Users can read their own accounts"
    ON accounts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own accounts
CREATE POLICY "Users can insert their own accounts"
    ON accounts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own accounts
CREATE POLICY "Users can update their own accounts"
    ON accounts
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy to allow users to delete their own accounts
CREATE POLICY "Users can delete their own accounts"
    ON accounts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_accounts_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_accounts_updated_at_column();

