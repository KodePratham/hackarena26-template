#!/bin/bash
# VitalScore Finance - Development Environment Setup Script

set -e

echo "=========================================="
echo "VitalScore Finance - Setup"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✓ Docker and Docker Compose are installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env file created"
    echo "⚠ Please update .env with your actual configuration values"
    echo ""
else
    echo "✓ .env file already exists"
    echo ""
fi

# Create necessary directories
echo "Creating project directories..."
mkdir -p backend/services/user-profile
mkdir -p backend/services/transaction-ingestion
mkdir -p backend/services/score-engine
mkdir -p backend/services/gamification
mkdir -p backend/services/blockchain-integration
mkdir -p backend/shared/utils
mkdir -p backend/shared/models
mkdir -p backend/api-gateway
mkdir -p frontend/mobile
mkdir -p frontend/web
mkdir -p blockchain/contracts
mkdir -p ml/categorization
mkdir -p infrastructure/terraform
mkdir -p infrastructure/docker
mkdir -p docs
mkdir -p logs
echo "✓ Project directories created"
echo ""

# Make migration script executable
chmod +x backend/database/migrations/run_migrations.sh
echo "✓ Migration script is executable"
echo ""

# Start Docker containers
echo "Starting Docker containers..."
docker-compose up -d
echo ""

# Wait for services to be healthy
echo "Waiting for services to be ready..."
sleep 10

# Check service health
echo "Checking service health..."
docker-compose ps
echo ""

# Run database migrations
echo "Running database migrations..."
if [ -f backend/database/migrations/run_migrations.sh ]; then
    ./backend/database/migrations/run_migrations.sh
    echo "✓ Database migrations completed"
else
    echo "⚠ Migration script not found, skipping..."
fi
echo ""

echo "=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo ""
echo "Services running:"
echo "  - PostgreSQL:      http://localhost:5432"
echo "  - Redis:           http://localhost:6379"
echo "  - InfluxDB:        http://localhost:8086"
echo "  - LocalStack:      http://localhost:4566"
echo "  - PgAdmin:         http://localhost:5050"
echo "  - Redis Commander: http://localhost:8081"
echo ""
echo "Next steps:"
echo "  1. Update .env with your configuration"
echo "  2. Start implementing microservices"
echo "  3. Run 'docker-compose logs -f' to view logs"
echo ""
echo "To stop services: docker-compose down"
echo "To restart: docker-compose restart"
echo "=========================================="
