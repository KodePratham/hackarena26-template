-- Squad Schema
-- Task 2.5: Create Squad schema in PostgreSQL

CREATE TYPE squad_status AS ENUM ('ACTIVE', 'COMPLETED', 'DISBANDED');
CREATE TYPE contribution_frequency AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');

CREATE TABLE squads (
    -- Task 2.5.1: squadId (uuid-v4, primary key)
    squad_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Task 2.5.2: name, creatorUserId, memberUserIds array
    name VARCHAR(255) NOT NULL,
    creator_user_id UUID NOT NULL,
    member_user_ids UUID[] NOT NULL CHECK (array_length(member_user_ids, 1) >= 3 AND array_length(member_user_ids, 1) <= 8),
    
    -- Task 2.5.3: configuration (contributionAmount, contributionFrequency, seasonDuration, seasonStartDate, seasonEndDate)
    configuration JSONB NOT NULL DEFAULT '{
        "contributionAmount": 0,
        "contributionFrequency": "WEEKLY",
        "seasonDuration": 90,
        "seasonStartDate": null,
        "seasonEndDate": null
    }'::jsonb,
    
    -- Task 2.5.4: treasury (algorandContractId, currentBalance, totalContributed, currentDefiProtocol, currentAPY, totalYieldAccumulated)
    treasury JSONB NOT NULL DEFAULT '{
        "algorandContractId": null,
        "currentBalance": 0,
        "totalContributed": 0,
        "currentDefiProtocol": null,
        "currentAPY": 0,
        "totalYieldAccumulated": 0
    }'::jsonb,
    
    -- Task 2.5.5: status, leaderboardRank
    status squad_status NOT NULL DEFAULT 'ACTIVE',
    leaderboard_rank INTEGER,
    
    -- Task 2.5.6: memberContributions array
    member_contributions JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign key
    CONSTRAINT fk_creator_user_id FOREIGN KEY (creator_user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- Squad member contributions tracking table (normalized)
CREATE TABLE squad_contributions (
    contribution_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    squad_id UUID NOT NULL,
    user_id UUID NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    contribution_date DATE NOT NULL,
    week_number INTEGER NOT NULL,
    transaction_hash VARCHAR(255),  -- Algorand transaction hash
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_squad_id FOREIGN KEY (squad_id) REFERENCES squads(squad_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- Squad invitations table
CREATE TABLE squad_invitations (
    invitation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    squad_id UUID NOT NULL,
    inviter_user_id UUID NOT NULL,
    invitee_user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')),
    invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    CONSTRAINT fk_squad_id FOREIGN KEY (squad_id) REFERENCES squads(squad_id) ON DELETE CASCADE,
    CONSTRAINT fk_inviter_user_id FOREIGN KEY (inviter_user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_invitee_user_id FOREIGN KEY (invitee_user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_squads_creator ON squads(creator_user_id);
CREATE INDEX idx_squads_status ON squads(status);
CREATE INDEX idx_squads_leaderboard_rank ON squads(leaderboard_rank) WHERE leaderboard_rank IS NOT NULL;
CREATE INDEX idx_squads_member_ids ON squads USING GIN (member_user_ids);

CREATE INDEX idx_squad_contributions_squad ON squad_contributions(squad_id);
CREATE INDEX idx_squad_contributions_user ON squad_contributions(user_id);
CREATE INDEX idx_squad_contributions_date ON squad_contributions(contribution_date);

CREATE INDEX idx_squad_invitations_squad ON squad_invitations(squad_id);
CREATE INDEX idx_squad_invitations_invitee ON squad_invitations(invitee_user_id);
CREATE INDEX idx_squad_invitations_status ON squad_invitations(status);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_squads_updated_at BEFORE UPDATE
    ON squads FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE squads IS 'Stores Squad Savings Pools with 3-8 members, DeFi yield management, and treasury tracking';
COMMENT ON COLUMN squads.member_user_ids IS 'Array of user IDs (3-8 members including creator)';
COMMENT ON COLUMN squads.configuration IS 'Squad season configuration including contribution amount and duration';
COMMENT ON COLUMN squads.treasury IS 'Treasury details including Algorand contract, balance, and DeFi protocol info';
COMMENT ON TABLE squad_contributions IS 'Normalized table tracking individual member contributions';
