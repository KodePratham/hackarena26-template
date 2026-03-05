# InfluxDB Time-Series Schema
## Task 2.6: Create time-series schema in InfluxDB for transaction events

InfluxDB uses a different schema model than relational databases. Below is the schema definition for time-series data.

## Measurement: transaction_events

### Tags (indexed)
- `user_token` - Anonymized user identifier
- `category_primary` - Essential or Discretionary
- `category_secondary` - Specific subcategory
- `merchant_normalized` - Normalized merchant name
- `is_recurring` - Boolean flag
- `is_shared` - Boolean flag

### Fields (not indexed)
- `amount` - Transaction amount (float)
- `category_confidence` - ML confidence score (float)
- `shared_user_share` - Proportional share (float)

### Timestamp
- Automatically indexed transaction timestamp

## Measurement: score_events

### Tags
- `user_id` - User identifier
- `period_type` - REALTIME, NIGHTLY, or MONTHLY
- `band` - Score band classification

### Fields
- `score` - VitalScore value (integer)
- `necessity_ratio` - Component value (float)
- `savings_ratio` - Component value (float)
- `debt_penalty` - Component value (float)
- `streak_bonus` - Component value (float)
- `challenge_bonus` - Component value (float)

### Timestamp
- Score calculation timestamp

## Measurement: challenge_events

### Tags
- `user_id` - User identifier
- `challenge_type` - Type of challenge
- `difficulty` - EASY, MEDIUM, or HARD
- `status` - Challenge status

### Fields
- `target_value` - Target amount (float)
- `actual_value` - Actual achieved value (float)
- `stake_amount` - Staked amount if applicable (float)

### Timestamp
- Event timestamp

## Retention Policies

```
CREATE RETENTION POLICY "one_year" ON "vitalscore" DURATION 52w REPLICATION 1 DEFAULT
CREATE RETENTION POLICY "three_months" ON "vitalscore" DURATION 13w REPLICATION 1
CREATE RETENTION POLICY "realtime" ON "vitalscore" DURATION 7d REPLICATION 1
```

## Continuous Queries

### Daily aggregations
```
CREATE CONTINUOUS QUERY "daily_spending_by_category" ON "vitalscore"
BEGIN
  SELECT sum(amount) AS total_amount
  INTO "vitalscore"."one_year"."daily_spending"
  FROM "transaction_events"
  GROUP BY time(1d), user_token, category_primary, category_secondary
END
```

### Weekly score averages
```
CREATE CONTINUOUS QUERY "weekly_score_avg" ON "vitalscore"
BEGIN
  SELECT mean(score) AS avg_score
  INTO "vitalscore"."one_year"."weekly_scores"
  FROM "score_events"
  WHERE period_type = 'NIGHTLY'
  GROUP BY time(1w), user_id
END
```
