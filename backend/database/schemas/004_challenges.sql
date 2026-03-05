-- Challenge Schema
-- Task 2.4: Create Challenge schema in PostgreSQL

CREATE TYPE challenge_type AS ENUM (
    'REDUCE_CATEGORY',
    'SAVINGS_VELOCITY',
    'CANCEL_SUBSCRIPTION',
    'BUILD_EMERGENCY_FUND',
    'INVESTMENT_ACTION'
);

CREATE TYPE challenge_difficulty AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE challenge_status AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED', 'STAKED');
CREATE TYPE verification_method AS ENUM ('BANK_DATA', 'MANUAL');

CREATE TABLE challenges (
    -- Task 2.4.1: challengeId (uuid-v4, primary key)
    challenge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Task 2.4.2: userId, weekStartDate, type, description
    user_id UUID NOT NULL,
    week_start_date DATE NOT NULL,
    challenge_type challenge_type NOT NULL,
    description TEXT NOT NULL,
    
    -- Task 2.4.3: target (category, currentBaseline, targetValue, unit)
    target JSONB NOT NULL DEFAULT '{
        "category": null,
        "currentBaseline": 0,
        "targetValue": 0,
        "unit": "INR"
    }'::jsonb,
    
    -- Task 2.4.4: difficulty, status
    difficulty challenge_difficulty NOT NULL,
    status challenge_status NOT NULL DEFAULT 'ACTIVE',
    
    -- Task 2.4.5: stake (enabled, amount, currency, escrowContractId, escrowTxnId, lockedAt)
    stake JSONB DEFAULT '{
        "enabled": false,
        "amount": 0,
        "currency": "INR",
        "escrowContractId": null,
        "escrowTxnId": null,
        "lockedAt": null
    }'::jsonb,
    
    -- Task 2.4.6: completedAt, verificationData
    completed_at TIMESTAMP WITH TIME ZONE,
    verification_data JSONB DEFAULT '{
        "method": null,
        "verifiedAt": null,
        "actualValue": null
    }'::jsonb,
    
    -- Task 2.4.7: rewards (vitalPoints, scoreBonusApplied, yieldShareEarned)
    rewards JSONB NOT NULL DEFAULT '{
        "vitalPoints": 0,
        "scoreBonusApplied": 0,
        "yieldShareEarned": 0
    }'::jsonb,
    
    -- Deadline tracking
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign key
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_challenges_user_id ON challenges(user_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_week_start ON challenges(week_start_date);
CREATE INDEX idx_challenges_deadline ON challenges(deadline);
CREATE INDEX idx_challenges_type ON challenges(challenge_type);

-- Composite indexes
CREATE INDEX idx_challenges_user_status ON challenges(user_id, status);
CREATE INDEX idx_challenges_user_week ON challenges(user_id, week_start_date DESC);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE
    ON challenges FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE challenges IS 'Stores weekly personalized financial challenges with optional on-chain stakes';
COMMENT ON COLUMN challenges.target IS 'Challenge target with category, baseline, target value, and unit';
COMMENT ON COLUMN challenges.stake IS 'Optional stake information including escrow contract details';
COMMENT ON COLUMN challenges.verification_data IS 'Challenge completion verification details';
COMMENT ON COLUMN challenges.rewards IS 'Rewards earned upon challenge completion';
