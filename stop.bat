@echo off
REM GraphRAG System Stop Script (Windows CMD)
REM This script stops all backend services

echo ========================================
echo   GraphRAG System - Shutting Down
echo ========================================
echo.

echo Stopping backend services...
cd backend
docker-compose down
if %errorlevel% equ 0 (
    echo [OK] Backend services stopped
) else (
    echo [ERROR] Failed to stop backend services
    cd ..
    exit /b 1
)
cd ..

echo.
echo ========================================
echo   All services stopped successfully!
echo ========================================
echo.
echo Note: Frontend stops automatically when you press Ctrl+C
