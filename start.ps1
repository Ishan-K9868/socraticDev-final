# GraphRAG System Startup Script (PowerShell)
# This script starts both backend and frontend services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GraphRAG System - Starting Up" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "[1/6] Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
Write-Host "[2/6] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed ($nodeVersion)" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js 16+ first." -ForegroundColor Red
    exit 1
}

# Start backend services
Write-Host "[3/6] Starting backend services..." -ForegroundColor Yellow
Set-Location backend
docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend services started" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start backend services" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Install essential Python dependencies
Write-Host "[3.5/6] Installing backend Python dependencies..." -ForegroundColor Yellow
pip install fastapi uvicorn python-dotenv celery redis --quiet --user
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠ Some dependencies may have failed, continuing anyway..." -ForegroundColor Yellow
}
Set-Location ..

# Wait for services to be ready
Write-Host "[4/6] Waiting for services to initialize (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30
Write-Host "✓ Services should be ready" -ForegroundColor Green

# Install frontend dependencies if needed
Write-Host "[5/6] Checking frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
if (-Not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
} else {
    Write-Host "✓ Frontend dependencies already installed" -ForegroundColor Green
}

# Start backend API and Celery
Write-Host "[6/7] Starting backend API and Celery worker..." -ForegroundColor Yellow
Set-Location backend
Start-Process -NoNewWindow python -ArgumentList "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"
Start-Sleep -Seconds 3
Start-Process -NoNewWindow python -ArgumentList "-m", "celery", "-A", "src.celery_app", "worker", "--loglevel=info", "--pool=solo"
Write-Host "✓ Backend API and Celery worker started" -ForegroundColor Green
Set-Location ..\frontend

# Start frontend
Write-Host "[7/7] Starting frontend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GraphRAG System is Running!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API:  http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs:     http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Frontend:     http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Neo4j Browser: http://localhost:7474" -ForegroundColor Cyan
Write-Host "RabbitMQ:      http://localhost:15672" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the frontend" -ForegroundColor Yellow
Write-Host "To stop all: Stop-Process -Name python; cd backend; docker-compose down" -ForegroundColor Yellow
Write-Host ""

# Start frontend dev server (this will block)
npm run dev

# Cleanup on exit
Set-Location ..
