-- Transaction Record Schema
-- Task 2.2: Create Transaction Record schema in PostgreSQL

CREATE TYPE category_primary AS ENUM ('Essential', 'Discretionary');
CREATE TYPE category_source AS ENUM ('ML_MODEL', 'RULE_BASED', 'USER_OVERRIDE');

CREATE TABLE transactions (
    -- Task 2.2.1: txnId (uuid-v4, primary key)
    txn_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Task 2.2.2: userToken, externalRef, amount, currency, date
    user_token VARCHAR(255) NOT NULL,  -- Anonymized user token
    external_ref VARCHAR(255),  -- Bank transaction reference
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    transaction_date DATE NOT NULL,
    transaction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Task 2.2.3: merchantNormalized, merchantRaw
    merchant_normalized VARCHAR(255) NOT NULL,
    merchant_raw TEXT NOT NULL,
    
    -- Task 2.2.4: category (primary, secondary, confidence, source)
    category_primary category_primary NOT NULL,
    category_secondary VARCHAR(50) NOT NULL,
    category_confidence DECIMAL(3, 2) NOT NULL CHECK (category_confidence >= 0 AND category_confidence <= 1),
    category_source category_source NOT NULL,
    
    -- Task 2.2.5: isRecurring, isShared, sharedUserShare
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    is_shared BOOLEAN NOT NULL DEFAULT false,
    shared_user_share DECIMAL(3, 2) NOT NULL DEFAULT 1.0 CHECK (shared_user_share > 0 AND shared_user_share <= 1),
    
    -- Task 2.2.6: isManualEntry, userOverride, flaggedForReview
    is_manual_entry BOOLEAN NOT NULL DEFAULT false,
    user_override JSONB,  -- Stores original category if user overrode
    flagged_for_review BOOLEAN NOT NULL DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign key to user (via token mapping table)
    CONSTRAINT fk_user_token FOREIGN KEY (user_token) REFERENCES user_token_mapping(user_token)
);

-- User token mapping table (for PII tokenization)
CREATE TABLE user_token_mapping (
    user_token VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- Essential sub-categories
CREATE TYPE essential_subcategory AS ENUM (
    'Rent/Mortgage',
    'Groceries',
    'Utilities',
    'Transport',
    'Insurance',
    'Education',
    'Healthcare',
    'EMI/Loan Repayment'
);

-- Discretionary sub-categories
CREATE TYPE discretionary_subcategory AS ENUM (
    'Dining Out',
    'Entertainment',
    'Subscriptions',
    'Shopping',
    'Travel',
    'Personal Care',
    'Gifting'
);

-- Task 2.7: Create indexes on userId, date, category fields
CREATE INDEX idx_transactions_user_token ON transactions(user_token);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_timestamp ON transactions(transaction_timestamp);
CREATE INDEX idx_transactions_category_primary ON transactions(category_primary);
CREATE INDEX idx_transactions_category_secondary ON transactions(category_secondary);
CREATE INDEX idx_transactions_merchant_normalized ON transactions(merchant_normalized);
CREATE INDEX idx_transactions_external_ref ON transactions(external_ref);
CREATE INDEX idx_transactions_flagged ON transactions(flagged_for_review) WHERE flagged_for_review = true;

-- Composite indexes for common queries
CREATE INDEX idx_transactions_user_date ON transactions(user_token, transaction_date DESC);
CREATE INDEX idx_transactions_user_category ON transactions(user_token, category_primary, transaction_date DESC);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE
    ON transactions FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE transactions IS 'Stores normalized transaction data with PII tokenization';
COMMENT ON COLUMN transactions.user_token IS 'Anonymized user identifier, never raw PII';
COMMENT ON COLUMN transactions.merchant_normalized IS 'Normalized merchant name for pattern matching';
COMMENT ON COLUMN transactions.category_confidence IS 'ML model confidence score (0.0 to 1.0)';
COMMENT ON COLUMN transactions.shared_user_share IS 'Proportional share for shared expenses (0.0 to 1.0)';
