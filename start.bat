@echo off
setlocal enabledelayedexpansion
REM GraphRAG System Startup Script (Windows CMD)
REM This script starts both backend and frontend services

echo ========================================
echo   GraphRAG System - Starting Up
echo ========================================
echo.

REM Clear Python cache
echo [0/6] Clearing Python cache...
cd backend
for /d /r %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d" 2>nul
del /s /q *.pyc 2>nul
cd ..
echo [OK] Cache cleared

REM Check if Docker is running
echo [1/7] Checking Docker...
docker ps >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker is running
) else (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    exit /b 1
)

REM Check if Node.js is installed
echo [2/7] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js is installed: !NODE_VERSION!
) else (
    echo [ERROR] Node.js is not installed. Please install Node.js 16+ first.
    exit /b 1
)

REM Start backend services
echo [3/7] Starting backend services...
cd backend
docker-compose up -d
if %errorlevel% equ 0 (
    echo [OK] Backend services started
) else (
    echo [ERROR] Failed to start backend services
    cd ..
    exit /b 1
)

REM Install essential Python dependencies
echo [3.5/7] Installing backend Python dependencies...
pip install fastapi uvicorn python-dotenv celery redis --quiet --user
if !errorlevel! equ 0 (
    echo [OK] Backend dependencies installed
) else (
    echo [WARNING] Some dependencies may have failed, continuing anyway...
)
cd ..

REM Wait for services to be ready
echo [4/7] Waiting for services to initialize (30 seconds)...
timeout /t 30 /nobreak >nul
echo [OK] Services should be ready

REM Install frontend dependencies if needed
echo [5/7] Checking frontend dependencies...
cd frontend
if not exist "node_modules\" (
    echo Installing frontend dependencies ^(this may take a few minutes^)...
    call npm install
    if !errorlevel! equ 0 (
        echo [OK] Frontend dependencies installed
    ) else (
        echo [ERROR] Failed to install frontend dependencies
        cd ..
        exit /b 1
    )
) else (
    echo [OK] Frontend dependencies already installed
)

REM Start backend API and Celery
echo [6/7] Starting backend API and Celery worker...
cd ..\backend
start /B python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
timeout /t 3 /nobreak >nul
start /B python -m celery -A src.celery_app worker --loglevel=info --pool=solo
echo [OK] Backend API and Celery worker started
cd ..\frontend

REM Start frontend
echo [7/7] Starting frontend...
echo.
echo ========================================
echo   GraphRAG System is Running!
echo ========================================
echo.
echo Backend API:  http://localhost:8000
echo API Docs:     http://localhost:8000/docs
echo Frontend:     http://localhost:5173
echo.
echo Neo4j Browser: http://localhost:7474
echo RabbitMQ:      http://localhost:15672
echo.
echo Press Ctrl+C to stop the frontend
echo To stop all: taskkill /F /IM python.exe ^&^& cd backend ^&^& docker-compose down
echo.

REM Start frontend dev server (this will block)
call npm run dev

REM Cleanup on exit
cd ..
