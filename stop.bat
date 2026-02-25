@echo off
setlocal EnableExtensions EnableDelayedExpansion
REM GraphRAG/SocraticDev stop script for Windows

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "COMPOSE_CMD="

echo ========================================
echo   SocraticDev - Shutting Down
echo ========================================
echo.

if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" (
    set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"
)

docker compose version >nul 2>&1
if !errorlevel! EQU 0 (
    set "COMPOSE_CMD=docker compose"
) else (
    where docker-compose >nul 2>&1
    if !errorlevel! EQU 0 set "COMPOSE_CMD=docker-compose"
)

echo Stopping backend Python workers...
powershell -NoProfile -Command "$root = [regex]::Escape('%BACKEND_DIR%'); $p = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match $root -and ( $_.CommandLine -match 'uvicorn\s+src\.main:app' -or $_.CommandLine -match 'celery(\.exe)?\s+-A\s+src\.celery_app\s+worker' ) }; if($p){ $p | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } }" >nul 2>&1
echo [OK] Backend Python workers stopped

if defined COMPOSE_CMD (
    echo Stopping Docker services...
    cd /d "%BACKEND_DIR%"
    call %COMPOSE_CMD% down
    if !errorlevel! EQU 0 (
        echo [OK] Docker services stopped
    ) else (
        echo [WARNING] Failed to stop Docker services via "%COMPOSE_CMD%"
    )
    cd /d "%ROOT_DIR%"
) else (
    echo [WARNING] Docker Compose command not found, skipped Docker shutdown
)

echo.
echo ========================================
echo   Shutdown Complete
echo ========================================
echo.
