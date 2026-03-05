#!/bin/bash
# Task 2.8: Set up database migration scripts
# Database migration runner for VitalScore Finance

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-vitalscore}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD}

echo "==================================="
echo "VitalScore Database Migration"
echo "==================================="
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "==================================="

# Check if PostgreSQL is accessible
echo "Checking database connection..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: Cannot connect to PostgreSQL"
    exit 1
fi
echo "✓ Database connection successful"

# Create database if it doesn't exist
echo "Creating database if not exists..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME" 2>/dev/null || echo "Database already exists"

# Run migrations in order
SCHEMA_DIR="$(dirname "$0")/../schemas"

echo ""
echo "Running migrations..."
echo "-----------------------------------"

for schema_file in $SCHEMA_DIR/*.sql; do
    if [ -f "$schema_file" ]; then
        filename=$(basename "$schema_file")
        echo "Applying: $filename"
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$schema_file"
        if [ $? -eq 0 ]; then
            echo "✓ $filename applied successfully"
        else
            echo "✗ ERROR applying $filename"
            exit 1
        fi
        echo ""
    fi
done

echo "==================================="
echo "✓ All migrations completed successfully"
echo "==================================="

# Create migration tracking table
echo "Creating migration tracking table..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF
CREATE TABLE IF NOT EXISTS schema_migrations (
    migration_id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Record applied migrations
INSERT INTO schema_migrations (filename)
SELECT filename FROM (
    VALUES 
        ('001_user_profile.sql'),
        ('002_transactions.sql'),
        ('003_score_snapshots.sql'),
        ('004_challenges.sql'),
        ('005_squads.sql'),
        ('006_supporting_tables.sql')
) AS t(filename)
ON CONFLICT (filename) DO NOTHING;
EOF

echo "✓ Migration tracking table created"
echo ""
echo "Database setup complete!"
