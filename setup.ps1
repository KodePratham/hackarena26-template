# VitalScore Finance - Windows PowerShell Setup Script

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "VitalScore Finance - Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Docker is not installed" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is available
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose is installed: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Docker Compose is not installed" -ForegroundColor Red
    Write-Host "Please install Docker Compose from: https://docs.docker.com/compose/install/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Create .env file if it doesn't exist
if (-Not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host "⚠ Please update .env with your actual configuration values" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
    Write-Host ""
}

# Create necessary directories
Write-Host "Creating project directories..." -ForegroundColor Yellow
$directories = @(
    "backend\services\user-profile",
    "backend\services\transaction-ingestion",
    "backend\services\score-engine",
    "backend\services\gamification",
    "backend\services\blockchain-integration",
    "backend\shared\utils",
    "backend\shared\models",
    "backend\api-gateway",
    "frontend\mobile",
    "frontend\web",
    "blockchain\contracts",
    "ml\categorization",
    "infrastructure\terraform",
    "infrastructure\docker",
    "docs",
    "logs"
)

foreach ($dir in $directories) {
    if (-Not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "✓ Project directories created" -ForegroundColor Green
Write-Host ""

# Start Docker containers
Write-Host "Starting Docker containers..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Docker containers started successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start Docker containers" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host "Checking service health..." -ForegroundColor Yellow
docker-compose ps
Write-Host ""

# Run database migrations (if PostgreSQL is ready)
Write-Host "Checking if PostgreSQL is ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$pgReady = $false

while ($attempt -lt $maxAttempts -and -not $pgReady) {
    try {
        $result = docker exec vitalscore-postgres pg_isready -U postgres 2>&1
        if ($result -match "accepting connections") {
            $pgReady = $true
            Write-Host "✓ PostgreSQL is ready" -ForegroundColor Green
        } else {
            $attempt++
            Write-Host "Waiting for PostgreSQL... ($attempt/$maxAttempts)" -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    } catch {
        $attempt++
        Write-Host "Waiting for PostgreSQL... ($attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $pgReady) {
    Write-Host "⚠ PostgreSQL is not ready yet. You may need to run migrations manually." -ForegroundColor Yellow
} else {
    # Run migrations
    Write-Host "Running database migrations..." -ForegroundColor Yellow
    
    # Set environment variables for migration script
    $env:DB_HOST = "localhost"
    $env:DB_PORT = "5432"
    $env:DB_NAME = "vitalscore"
    $env:DB_USER = "postgres"
    $env:DB_PASSWORD = "vitalscore_dev_password"
    
    # Run migrations for each schema file
    $schemaFiles = Get-ChildItem -Path "backend\database\schemas\*.sql" | Sort-Object Name
    
    foreach ($schemaFile in $schemaFiles) {
        Write-Host "Applying: $($schemaFile.Name)" -ForegroundColor Cyan
        
        $sqlContent = Get-Content $schemaFile.FullName -Raw
        
        # Execute SQL using docker exec
        $sqlContent | docker exec -i vitalscore-postgres psql -U postgres -d vitalscore
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $($schemaFile.Name) applied successfully" -ForegroundColor Green
        } else {
            Write-Host "✗ ERROR applying $($schemaFile.Name)" -ForegroundColor Red
        }
    }
    
    Write-Host "✓ Database migrations completed" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services running:" -ForegroundColor Yellow
Write-Host "  - PostgreSQL:      http://localhost:5432" -ForegroundColor White
Write-Host "  - Redis:           http://localhost:6379" -ForegroundColor White
Write-Host "  - InfluxDB:        http://localhost:8086" -ForegroundColor White
Write-Host "  - LocalStack:      http://localhost:4566" -ForegroundColor White
Write-Host "  - PgAdmin:         http://localhost:5050" -ForegroundColor White
Write-Host "  - Redis Commander: http://localhost:8081" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update .env with your configuration" -ForegroundColor White
Write-Host "  2. Start User Profile Service:" -ForegroundColor White
Write-Host "     cd backend\services\user-profile" -ForegroundColor Cyan
Write-Host "     npm install" -ForegroundColor Cyan
Write-Host "     npm run dev" -ForegroundColor Cyan
Write-Host "  3. View logs: docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "To stop services: docker-compose down" -ForegroundColor Yellow
Write-Host "To restart: docker-compose restart" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
