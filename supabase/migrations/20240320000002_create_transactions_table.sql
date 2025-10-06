-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    merchant VARCHAR(255),
    category VARCHAR(100),
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    bank_account_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_bank_account_number ON transactions(bank_account_number);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read only their own transactions
CREATE POLICY "Users can read their own transactions"
    ON transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own transactions
CREATE POLICY "Users can insert their own transactions"
    ON transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own transactions
CREATE POLICY "Users can update their own transactions"
    ON transactions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy to allow users to delete their own transactions
CREATE POLICY "Users can delete their own transactions"
    ON transactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_transactions_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_transactions_updated_at_column();

