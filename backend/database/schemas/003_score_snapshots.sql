-- VitalScore Snapshot Schema
-- Task 2.3: Create VitalScore Snapshot schema in PostgreSQL

CREATE TYPE period_type AS ENUM ('REALTIME', 'NIGHTLY', 'MONTHLY');
CREATE TYPE score_band AS ENUM ('VITAL_ELITE', 'VITAL_STRONG', 'VITAL_WARNING', 'VITAL_CRITICAL', 'VITAL_EMERGENCY');
CREATE TYPE trajectory AS ENUM ('IMPROVING', 'STABLE', 'DECLINING');

CREATE TABLE score_snapshots (
    -- Task 2.3.1: snapshotId (uuid-v4, primary key)
    snapshot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Task 2.3.2: userId, timestamp, periodType
    user_id UUID NOT NULL,
    snapshot_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    period_type period_type NOT NULL,
    
    -- Task 2.3.3: score, band, trajectory
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
    band score_band NOT NULL,
    trajectory trajectory,
    
    -- Task 2.3.4: components (necessityRatio, savingsRatio, debtPenalty, streakBonus, challengeBonus, inflationAdjustment)
    components JSONB NOT NULL DEFAULT '{
        "necessityRatio": 0,
        "savingsRatio": 0,
        "debtPenalty": 0,
        "streakBonus": 0,
        "challengeBonus": 0,
        "inflationAdjustment": 0
    }'::jsonb,
    
    -- Task 2.3.5: inputSummary (essentialSpendAvg3M, discretionarySpendAvg3M, incomeAvg3M, activeChallenges, streakDays)
    input_summary JSONB NOT NULL DEFAULT '{
        "essentialSpendAvg3M": 0,
        "discretionarySpendAvg3M": 0,
        "incomeAvg3M": 0,
        "activeChallenges": 0,
        "streakDays": 0
    }'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign key
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- Task 2.7: Create indexes
CREATE INDEX idx_score_snapshots_user_id ON score_snapshots(user_id);
CREATE INDEX idx_score_snapshots_timestamp ON score_snapshots(snapshot_timestamp DESC);
CREATE INDEX idx_score_snapshots_period_type ON score_snapshots(period_type);
CREATE INDEX idx_score_snapshots_band ON score_snapshots(band);

-- Composite indexes for common queries
CREATE INDEX idx_score_snapshots_user_timestamp ON score_snapshots(user_id, snapshot_timestamp DESC);
CREATE INDEX idx_score_snapshots_user_period ON score_snapshots(user_id, period_type, snapshot_timestamp DESC);

-- Unique constraint for monthly snapshots (one per user per month)
CREATE UNIQUE INDEX idx_score_snapshots_monthly_unique 
    ON score_snapshots(user_id, DATE_TRUNC('month', snapshot_timestamp))
    WHERE period_type = 'MONTHLY';

-- Comments for documentation
COMMENT ON TABLE score_snapshots IS 'Stores VitalScore calculations with component breakdown and input summary';
COMMENT ON COLUMN score_snapshots.period_type IS 'REALTIME: triggered by transaction, NIGHTLY: batch recalculation, MONTHLY: for NFT snapshot';
COMMENT ON COLUMN score_snapshots.components IS 'Breakdown of score calculation components';
COMMENT ON COLUMN score_snapshots.input_summary IS 'Summary of financial inputs used in calculation';
