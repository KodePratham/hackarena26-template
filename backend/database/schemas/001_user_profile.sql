-- User Profile Schema
-- Task 2.1: Create User Profile schema in PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE income_bracket AS ENUM ('TIER_1', 'TIER_2', 'TIER_3', 'TIER_4');
CREATE TYPE income_type AS ENUM ('SALARIED', 'FREELANCE', 'BUSINESS', 'STUDENT');
CREATE TYPE location_type AS ENUM ('URBAN', 'RURAL');
CREATE TYPE kyc_status AS ENUM ('VERIFIED', 'PENDING', 'FAILED');
CREATE TYPE notification_frequency AS ENUM ('ESSENTIAL', 'STANDARD', 'FULL');

CREATE TABLE user_profiles (
    -- Task 2.1.1: userId (uuid-v4, primary key)
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Task 2.1.2: createdAt, kycStatus fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    kyc_status kyc_status NOT NULL DEFAULT 'PENDING',
    kyc_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Task 2.1.3: incomeProfile (bracket, declaredMonthlyIncome, incomeType)
    income_bracket income_bracket NOT NULL,
    declared_monthly_income DECIMAL(12, 2) NOT NULL,
    income_type income_type NOT NULL,
    
    -- Task 2.1.4: locationProfile (type, state, city)
    location_type location_type NOT NULL,
    location_state VARCHAR(100) NOT NULL,
    location_city VARCHAR(100) NOT NULL,
    
    -- Task 2.1.5: leagueId, algorandAddress, sbtAssetId
    league_id VARCHAR(50) NOT NULL,
    algorand_address VARCHAR(58) NOT NULL,
    sbt_asset_id BIGINT,
    
    -- Task 2.1.6: householdConfig (sharedExpenses array)
    household_config JSONB DEFAULT '{"sharedExpenses": []}'::jsonb,
    
    -- Task 2.1.7: consentFlags (escrowEnabled, squadEnabled, etc.)
    consent_flags JSONB NOT NULL DEFAULT '{
        "escrowEnabled": false,
        "squadEnabled": false,
        "anonymizedDataSharing": false,
        "b2bParticipant": false
    }'::jsonb,
    
    -- Task 2.1.8: notificationPreferences
    notification_preferences JSONB NOT NULL DEFAULT '{
        "frequency": "STANDARD",
        "streakAlerts": true,
        "challengeAlerts": true,
        "forecastAlerts": true
    }'::jsonb,
    
    -- Indexes
    CONSTRAINT unique_algorand_address UNIQUE (algorand_address)
);

-- Task 2.7: Create indexes on userId, date, category fields
CREATE INDEX idx_user_profiles_league ON user_profiles(league_id);
CREATE INDEX idx_user_profiles_income_bracket ON user_profiles(income_bracket);
CREATE INDEX idx_user_profiles_kyc_status ON user_profiles(kyc_status);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE
    ON user_profiles FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'Stores user identity, preferences, income profile, location classification, and league assignment';
COMMENT ON COLUMN user_profiles.user_id IS 'Internal token, never raw PII';
COMMENT ON COLUMN user_profiles.household_config IS 'Shared expense configuration with merchant patterns and user share percentages';
COMMENT ON COLUMN user_profiles.consent_flags IS 'Feature consent flags for escrow, squad, data sharing, and B2B participation';
