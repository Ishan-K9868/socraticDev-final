@echo off
setlocal EnableExtensions EnableDelayedExpansion
REM GraphRAG/SocraticDev stop script for Windows

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "API_PORT=8002"
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

echo Verifying API port %API_PORT% ownership...
powershell -NoProfile -Command "$port = %API_PORT%; $root = [regex]::Escape('%BACKEND_DIR%'); $left = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $port }; if(-not $left){ Write-Output 'CLEAR'; exit 0 }; $unmanaged = $false; foreach($conn in $left){ $pid = $conn.OwningProcess; $proc = Get-CimInstance Win32_Process -Filter ('ProcessId=' + $pid) -ErrorAction SilentlyContinue; if(-not $proc){ continue }; if($proc.CommandLine -match $root -and $proc.CommandLine -match 'uvicorn\s+src\.main:app'){ try { Stop-Process -Id $pid -Force -ErrorAction Stop } catch{} } else { $unmanaged = $true; Write-Output ('UNMANAGED:' + $pid) } }; if($unmanaged){ exit 2 } else { exit 0 }" >"%BACKEND_DIR%\logs\stop_port_check.log" 2>&1
if %errorlevel% EQU 2 (
    echo [WARNING] Port %API_PORT% is still used by non-SocraticDev process(es):
    type "%BACKEND_DIR%\logs\stop_port_check.log"
) else (
    echo [OK] API port ownership check complete
)

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
