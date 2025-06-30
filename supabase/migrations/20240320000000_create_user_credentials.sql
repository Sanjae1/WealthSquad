-- Create user_credentials table
CREATE TABLE IF NOT EXISTS user_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Create RLS policies
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read only their own credentials
CREATE POLICY "Users can read their own credentials"
    ON user_credentials
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own credentials
CREATE POLICY "Users can insert their own credentials"
    ON user_credentials
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own credentials
CREATE POLICY "Users can update their own credentials"
    ON user_credentials
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_credentials_updated_at
    BEFORE UPDATE ON user_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 