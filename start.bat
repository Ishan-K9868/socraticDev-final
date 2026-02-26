@echo off
setlocal EnableExtensions EnableDelayedExpansion
REM GraphRAG/SocraticDev startup script for Windows
REM Goal: first-run bootstrap with minimal manual setup

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "FRONTEND_DIR=%ROOT_DIR%\frontend"
set "BACKEND_ENV=%BACKEND_DIR%\.env"
set "BACKEND_ENV_EXAMPLE=%BACKEND_DIR%\.env.example"
set "FRONTEND_ENV=%FRONTEND_DIR%\.env.local"
set "FRONTEND_ENV_EXAMPLE=%FRONTEND_DIR%\.env.example"
set "BACKEND_REQ=%BACKEND_DIR%\requirements.txt"
set "BACKEND_DEPS_MARKER=%BACKEND_DIR%\.deps_installed"
set "VENV_DIR=%BACKEND_DIR%\.venv"
set "BACKEND_PYTHON=%VENV_DIR%\Scripts\python.exe"
set "API_PORT=8002"
set "API_BASE_URL=http://localhost:%API_PORT%"
set "SYSTEM_PYTHON="
set "COMPOSE_CMD="

echo ========================================
echo   SocraticDev - Full Startup Bootstrap
echo ========================================
echo.

if not exist "%BACKEND_DIR%" (
    call :fail "Backend directory not found: %BACKEND_DIR%"
    exit /b 1
)
if not exist "%FRONTEND_DIR%" (
    call :fail "Frontend directory not found: %FRONTEND_DIR%"
    exit /b 1
)

call :refresh_path_hints

echo [1/11] Checking Python...
call :resolve_python
if errorlevel 1 call :attempt_python_install
call :resolve_python
if errorlevel 1 (
    call :fail "Python 3.10+ is required."
    exit /b 1
)
call :validate_python_version
if errorlevel 1 (
    echo [INFO] Existing Python is below 3.10. Attempting upgrade...
    call :attempt_python_install
    call :resolve_python
    if errorlevel 1 (
        call :fail "Python executable was not found after installation."
        exit /b 1
    )
    call :validate_python_version
    if errorlevel 1 (
        call :fail "Python 3.10+ is required."
        exit /b 1
    )
)
echo [OK] Python detected: %SYSTEM_PYTHON%

echo [2/11] Checking Node.js + npm...
call :ensure_node
if errorlevel 1 call :attempt_node_install
call :ensure_node
if errorlevel 1 (
    call :fail "Node.js 18+ is required."
    exit /b 1
)
call :ensure_npm
if errorlevel 1 (
    call :fail "npm is required and should ship with Node.js."
    exit /b 1
)
echo [OK] Node.js and npm are available

echo [3/11] Checking Docker...
call :ensure_docker_cli
if errorlevel 1 call :attempt_docker_install
call :ensure_docker_cli
if errorlevel 1 (
    call :fail "Docker is required (Docker Desktop)."
    exit /b 1
)
call :ensure_compose_command
if errorlevel 1 (
    echo [INFO] Docker Compose not found. Attempting Docker Desktop install/update...
    call :attempt_docker_install
    call :ensure_compose_command
    if errorlevel 1 (
        call :fail "Docker Compose is required (docker compose or docker-compose)."
        exit /b 1
    )
)
call :ensure_docker_daemon
if errorlevel 1 (
    call :fail "Docker daemon is not running."
    exit /b 1
)
echo [OK] Docker is running

echo [4/11] Preparing environment files...
call :ensure_env_file "%BACKEND_ENV%" "%BACKEND_ENV_EXAMPLE%"
if errorlevel 1 (
    call :fail "Backend environment bootstrap failed."
    exit /b 1
)
call :ensure_env_file "%FRONTEND_ENV%" "%FRONTEND_ENV_EXAMPLE%"
if errorlevel 1 (
    call :fail "Frontend environment bootstrap failed."
    exit /b 1
)
call :ensure_frontend_api_base_url
if errorlevel 1 (
    call :fail "Failed to ensure VITE_API_BASE_URL in frontend .env.local."
    exit /b 1
)
call :warn_if_placeholder_keys
echo [OK] Environment files are ready

echo [5/11] Clearing Python cache...
call :clear_python_cache
echo [OK] Python cache cleared

echo [6/11] Preparing backend virtual environment...
if not exist "%BACKEND_PYTHON%" (
    "%SYSTEM_PYTHON%" -m venv "%VENV_DIR%"
    if errorlevel 1 (
        call :fail "Failed to create backend virtual environment."
        exit /b 1
    )
)
echo [OK] Virtual environment ready

echo [7/11] Installing backend dependencies...
call :backend_deps_up_to_date
if errorlevel 1 (
    "%BACKEND_PYTHON%" -m pip install --upgrade pip --disable-pip-version-check >nul
    if errorlevel 1 (
        call :fail "Failed to upgrade pip in backend virtual environment."
        exit /b 1
    )
    "%BACKEND_PYTHON%" -m pip install -r "%BACKEND_REQ%" --disable-pip-version-check
    if errorlevel 1 (
        del /q "%BACKEND_DEPS_MARKER%" >nul 2>&1
        call :fail "Failed to install backend dependencies."
        exit /b 1
    )
    >"%BACKEND_DEPS_MARKER%" echo ok
) else (
    echo [INFO] Backend dependencies already up to date
)
echo [OK] Backend dependencies installed

echo [8/11] Installing frontend dependencies...
cd /d "%FRONTEND_DIR%"
if not exist "node_modules\" (
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        call :fail "Failed to install frontend dependencies."
        exit /b 1
    )
) else (
    echo [INFO] node_modules already exists, skipping npm install
)
echo [OK] Frontend dependencies ready

echo [9/11] Starting Docker infrastructure...
cd /d "%BACKEND_DIR%"
call %COMPOSE_CMD% up -d --remove-orphans
if errorlevel 1 (
    call :fail "Failed to start Docker services."
    exit /b 1
)
echo [9.5/11] Validating Docker services...
echo [INFO] Skipping deep Docker health validation in startup script
echo [OK] Docker services started

echo [10/11] Starting backend API + Celery worker...
call :start_backend_processes
if errorlevel 1 (
    call :fail "Failed to start backend processes."
    exit /b 1
)
call :wait_for_api "%API_BASE_URL%/health" 90
if errorlevel 1 (
    echo [WARNING] Backend health endpoint did not become ready in time.
    echo [WARNING] Check API/Celery windows for errors.
) else (
    echo [OK] Backend API is responding
)

echo [11/11] Starting frontend dev server...
echo.
echo ========================================
echo   SocraticDev is running
echo ========================================
echo API:         %API_BASE_URL%
echo API Docs:    %API_BASE_URL%/docs
echo Frontend:    http://localhost:5173
echo Neo4j:       http://localhost:7474  (neo4j/password)
echo RabbitMQ:    http://localhost:15672 (guest/guest)
echo.
echo Press Ctrl+C in this window to stop frontend.
echo Use stop.bat to stop Docker + backend Python workers.
echo.
cd /d "%FRONTEND_DIR%"
call npm run dev
exit /b 0

:refresh_path_hints
if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" (
    set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"
)
if exist "%ProgramFiles%\nodejs\node.exe" (
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
)
if exist "%LocalAppData%\Programs\Python\Python311\python.exe" (
    set "PATH=%LocalAppData%\Programs\Python\Python311;%LocalAppData%\Programs\Python\Python311\Scripts;%PATH%"
)
if exist "%LocalAppData%\Programs\Python\Python310\python.exe" (
    set "PATH=%LocalAppData%\Programs\Python\Python310;%LocalAppData%\Programs\Python\Python310\Scripts;%PATH%"
)
if exist "%ProgramFiles%\Python311\python.exe" (
    set "PATH=%ProgramFiles%\Python311;%ProgramFiles%\Python311\Scripts;%PATH%"
)
if exist "%ProgramFiles%\Python310\python.exe" (
    set "PATH=%ProgramFiles%\Python310;%ProgramFiles%\Python310\Scripts;%PATH%"
)
if exist "%ProgramFiles(x86)%\Python311\python.exe" (
    set "PATH=%ProgramFiles(x86)%\Python311;%ProgramFiles(x86)%\Python311\Scripts;%PATH%"
)
if exist "%ProgramFiles(x86)%\Python310\python.exe" (
    set "PATH=%ProgramFiles(x86)%\Python310;%ProgramFiles(x86)%\Python310\Scripts;%PATH%"
)
exit /b 0

:resolve_python
set "SYSTEM_PYTHON="
for %%V in (3.12 3.11 3.10) do (
    for /f "usebackq delims=" %%P in (`py -%%V -c "import sys; print(sys.executable)" 2^>nul`) do (
        set "SYSTEM_PYTHON=%%P"
    )
    if defined SYSTEM_PYTHON goto :resolve_python_done
)
for /f "usebackq delims=" %%P in (`py -3 -c "import sys; print(sys.executable)" 2^>nul`) do (
    set "SYSTEM_PYTHON=%%P"
)
if defined SYSTEM_PYTHON goto :resolve_python_done
for /f "usebackq delims=" %%P in (`python -c "import sys; print(sys.executable)" 2^>nul`) do (
    set "SYSTEM_PYTHON=%%P"
)
if defined SYSTEM_PYTHON goto :resolve_python_done

for %%P in (
    "%LocalAppData%\Programs\Python\Python312\python.exe"
    "%LocalAppData%\Programs\Python\Python311\python.exe"
    "%LocalAppData%\Programs\Python\Python310\python.exe"
    "%ProgramFiles%\Python312\python.exe"
    "%ProgramFiles%\Python311\python.exe"
    "%ProgramFiles%\Python310\python.exe"
    "%ProgramFiles(x86)%\Python312\python.exe"
    "%ProgramFiles(x86)%\Python311\python.exe"
    "%ProgramFiles(x86)%\Python310\python.exe"
) do (
    if exist %%~P set "SYSTEM_PYTHON=%%~P"
    if defined SYSTEM_PYTHON goto :resolve_python_done
)
:resolve_python_done
if defined SYSTEM_PYTHON (exit /b 0) else (exit /b 1)

:validate_python_version
if not defined SYSTEM_PYTHON exit /b 1
"%SYSTEM_PYTHON%" -c "import sys; raise SystemExit(0 if sys.version_info[:2] >= (3, 10) else 1)" >nul 2>&1
exit /b %errorlevel%

:ensure_node
where node >nul 2>&1 || exit /b 1
set "NODE_MAJOR="
set "NODE_VERSION_RAW="
for /f "tokens=1 delims=." %%V in ('node -v 2^>nul') do set "NODE_VERSION_RAW=%%V"
if defined NODE_VERSION_RAW set "NODE_MAJOR=%NODE_VERSION_RAW:v=%"
if not defined NODE_MAJOR exit /b 1
if %NODE_MAJOR% LSS 18 exit /b 1
exit /b 0

:ensure_npm
where npm >nul 2>&1
exit /b %errorlevel%

:ensure_docker_cli
where docker >nul 2>&1
exit /b %errorlevel%

:ensure_compose_command
set "COMPOSE_CMD="
docker compose version >nul 2>&1
if %errorlevel% EQU 0 (
    set "COMPOSE_CMD=docker compose"
    exit /b 0
)
where docker-compose >nul 2>&1
if %errorlevel% EQU 0 (
    set "COMPOSE_CMD=docker-compose"
    exit /b 0
)
exit /b 1

:ensure_docker_daemon
docker info >nul 2>&1
if %errorlevel% EQU 0 exit /b 0

echo [INFO] Docker Desktop is not running. Attempting to start it...
if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
    start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
) else if exist "%LocalAppData%\Programs\Docker\Docker\Docker Desktop.exe" (
    start "" "%LocalAppData%\Programs\Docker\Docker\Docker Desktop.exe"
)

for /l %%I in (1,1,120) do (
    docker info >nul 2>&1
    if !errorlevel! EQU 0 exit /b 0
    timeout /t 1 /nobreak >nul
)
exit /b 1

:attempt_python_install
echo [INFO] Python not found. Attempting automatic install via winget...
where winget >nul 2>&1
if errorlevel 1 (
    echo [ERROR] winget is not available. Install "Python 3.11" manually, then rerun start.bat.
    exit /b 1
)
winget install -e --id Python.Python.3.11 --accept-package-agreements --accept-source-agreements
if errorlevel 1 (
    echo [ERROR] Failed to install Python 3.11 automatically.
    exit /b 1
)
echo [OK] Installed Python 3.11
call :refresh_path_hints
exit /b 0

:attempt_node_install
echo [INFO] Node.js 18+ not found. Attempting automatic install via winget...
where winget >nul 2>&1
if errorlevel 1 (
    echo [ERROR] winget is not available. Install "Node.js LTS" manually, then rerun start.bat.
    exit /b 1
)
winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
if errorlevel 1 (
    echo [ERROR] Failed to install Node.js LTS automatically.
    exit /b 1
)
echo [OK] Installed Node.js LTS
call :refresh_path_hints
exit /b 0

:attempt_docker_install
echo [INFO] Docker not found. Attempting automatic install via winget...
where winget >nul 2>&1
if errorlevel 1 (
    echo [ERROR] winget is not available. Install "Docker Desktop" manually, then rerun start.bat.
    exit /b 1
)
winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
if errorlevel 1 (
    echo [ERROR] Failed to install Docker Desktop automatically.
    exit /b 1
)
echo [OK] Installed Docker Desktop
call :refresh_path_hints
exit /b 0

:ensure_env_file
set "TARGET_FILE=%~1"
set "SOURCE_FILE=%~2"
if exist "%TARGET_FILE%" exit /b 0
if not exist "%SOURCE_FILE%" (
    echo [ERROR] Missing template: %SOURCE_FILE%
    exit /b 1
)
copy "%SOURCE_FILE%" "%TARGET_FILE%" >nul
if errorlevel 1 (
    echo [ERROR] Failed to create %TARGET_FILE%
    exit /b 1
)
echo [INFO] Created %TARGET_FILE% from template
exit /b 0

:ensure_frontend_api_base_url
if not exist "%FRONTEND_ENV%" exit /b 1
powershell -NoProfile -Command "$path = '%FRONTEND_ENV%'; $target = 'VITE_API_BASE_URL=%API_BASE_URL%'; $lines = Get-Content -Path $path -ErrorAction SilentlyContinue; $found = $false; $out = New-Object System.Collections.Generic.List[string]; foreach($line in $lines){ if($line -match '^VITE_API_BASE_URL='){ if(-not $found){ $out.Add($target); $found = $true }; continue }; $out.Add($line) }; if(-not $found){ $out.Add($target) }; Set-Content -Path $path -Value $out -Encoding UTF8"
exit /b %errorlevel%

:warn_if_placeholder_keys
findstr /c:"VITE_GEMINI_API_KEY=your_gemini_api_key_here" "%FRONTEND_ENV%" >nul 2>&1
if %errorlevel% EQU 0 (
    echo [WARNING] frontend\.env.local still has a placeholder Gemini key.
)
findstr /c:"GEMINI_API_KEY=your-api-key-here" "%BACKEND_ENV%" >nul 2>&1
if %errorlevel% EQU 0 (
    echo [WARNING] backend\.env still has a placeholder Gemini key.
)
exit /b 0

:clear_python_cache
cd /d "%BACKEND_DIR%"
for /d /r %%D in (__pycache__) do @if exist "%%D" rd /s /q "%%D" 2>nul
del /s /q *.pyc 2>nul
cd /d "%ROOT_DIR%"
exit /b 0

:start_backend_processes
cd /d "%BACKEND_DIR%"
call :ensure_log_dir

call :check_http_url "%API_BASE_URL%/health" 2
if %errorlevel% NEQ 0 (
    call :launch_api_process
    if errorlevel 1 exit /b 1
) else (
    call :check_api_signature 2
    if !errorlevel! EQU 0 (
        echo [INFO] API is already healthy on port %API_PORT%, skipping launch
    ) else (
        echo [WARNING] API is healthy but missing /api/visualization/analyze. Restarting API process...
        call :clear_listener_on_api_port
        if errorlevel 1 exit /b 1
        call :launch_api_process
        if errorlevel 1 exit /b 1
    )
)

call :is_pid_file_process_running "%BACKEND_DIR%\logs\celery.pid"
if %errorlevel% NEQ 0 (
    del /q "%BACKEND_DIR%\logs\celery.pid" >nul 2>&1
    powershell -NoProfile -Command "$p = Start-Process -FilePath '%BACKEND_PYTHON%' -ArgumentList '-m celery -A src.celery_app worker --loglevel=info --pool=solo' -WorkingDirectory '%BACKEND_DIR%' -PassThru -RedirectStandardOutput '%BACKEND_DIR%\logs\celery.out.log' -RedirectStandardError '%BACKEND_DIR%\logs\celery.err.log'; Set-Content -Path '%BACKEND_DIR%\logs\celery.pid' -Value $p.Id"
    if errorlevel 1 (
        echo [ERROR] Failed to launch Celery process.
        exit /b 1
    )
) else (
    echo [INFO] Celery worker already running, skipping launch
)

call :wait_for_api "%API_BASE_URL%/health" 40
if errorlevel 1 (
    echo [ERROR] API process did not become healthy.
    call :print_log_excerpt "%BACKEND_DIR%\logs\api.out.log" 30 "API stdout"
    call :print_log_excerpt "%BACKEND_DIR%\logs\api.err.log" 30 "API stderr"
    exit /b 1
)
call :wait_for_expected_api 40
if errorlevel 1 (
    echo [ERROR] API process did not expose expected endpoints.
    call :print_log_excerpt "%BACKEND_DIR%\logs\api.out.log" 30 "API stdout"
    call :print_log_excerpt "%BACKEND_DIR%\logs\api.err.log" 30 "API stderr"
    exit /b 1
)
call :wait_for_pid_file_process "%BACKEND_DIR%\logs\celery.pid" "Celery worker" 20
if errorlevel 1 exit /b 1

cd /d "%ROOT_DIR%"
exit /b 0

:launch_api_process
del /q "%BACKEND_DIR%\logs\api.pid" >nul 2>&1
powershell -NoProfile -Command "$p = Start-Process -FilePath '%BACKEND_PYTHON%' -ArgumentList '-m uvicorn src.main:app --host 0.0.0.0 --port %API_PORT% --reload' -WorkingDirectory '%BACKEND_DIR%' -PassThru -RedirectStandardOutput '%BACKEND_DIR%\logs\api.out.log' -RedirectStandardError '%BACKEND_DIR%\logs\api.err.log'; Set-Content -Path '%BACKEND_DIR%\logs\api.pid' -Value $p.Id"
if errorlevel 1 (
    echo [ERROR] Failed to launch API process.
    exit /b 1
)
timeout /t 2 /nobreak >nul
exit /b 0

:wait_for_pid_file_process
set "PID_FILE=%~1"
set "PROCESS_LABEL=%~2"
set "WAIT_SECONDS=%~3"
if not defined WAIT_SECONDS set "WAIT_SECONDS=20"
for /l %%I in (1,1,%WAIT_SECONDS%) do (
    call :is_pid_file_process_running "%PID_FILE%"
    if !errorlevel! EQU 0 exit /b 0
    timeout /t 1 /nobreak >nul
)
if not defined PROCESS_LABEL set "PROCESS_LABEL=Process"
echo [ERROR] %PROCESS_LABEL% did not start successfully
if /I "%PROCESS_LABEL%"=="Celery worker" (
    call :print_log_excerpt "%BACKEND_DIR%\logs\celery.out.log" 30 "Celery stdout"
    call :print_log_excerpt "%BACKEND_DIR%\logs\celery.err.log" 30 "Celery stderr"
)
exit /b 1

:is_pid_file_process_running
set "PID_FILE=%~1"
if not exist "%PID_FILE%" exit /b 1
set "PROCESS_PID="
for /f "usebackq delims=" %%P in ("%PID_FILE%") do (
    set "PROCESS_PID=%%P"
    goto :is_pid_loaded
)
:is_pid_loaded
if not defined PROCESS_PID exit /b 1
powershell -NoProfile -Command "if(Get-Process -Id %PROCESS_PID% -ErrorAction SilentlyContinue){ exit 0 } else { exit 1 }" >nul 2>&1
exit /b %errorlevel%

:wait_for_api
set "WAIT_URL=%~1"
set "WAIT_SECONDS=%~2"
if not defined WAIT_SECONDS set "WAIT_SECONDS=60"

for /l %%I in (1,1,%WAIT_SECONDS%) do (
    call :check_http_url "%WAIT_URL%" 2
    if !errorlevel! EQU 0 exit /b 0
    timeout /t 1 /nobreak >nul
)
exit /b 1

:wait_for_expected_api
set "WAIT_SECONDS=%~1"
if not defined WAIT_SECONDS set "WAIT_SECONDS=60"
for /l %%I in (1,1,%WAIT_SECONDS%) do (
    call :check_api_signature 2
    if !errorlevel! EQU 0 exit /b 0
    timeout /t 1 /nobreak >nul
)
exit /b 1

:ensure_log_dir
if not exist "%BACKEND_DIR%\logs\" mkdir "%BACKEND_DIR%\logs" >nul 2>&1
exit /b 0

:print_log_excerpt
set "LOG_FILE=%~1"
set "LOG_LINES=%~2"
set "LOG_LABEL=%~3"
if not defined LOG_LINES set "LOG_LINES=25"
if not defined LOG_LABEL set "LOG_LABEL=Log"
if not exist "%LOG_FILE%" (
    echo [INFO] %LOG_LABEL% log file not found yet: %LOG_FILE%
    exit /b 0
)
echo [INFO] Last %LOG_LINES% lines from %LOG_LABEL% log:
powershell -NoProfile -Command "Get-Content -Path '%LOG_FILE%' -Tail %LOG_LINES% -ErrorAction SilentlyContinue"
exit /b 0

:wait_for_docker_health
set "WAIT_SECONDS=%~1"
if not defined WAIT_SECONDS set "WAIT_SECONDS=180"

for /l %%I in (1,1,%WAIT_SECONDS%) do (
    call :check_http_url "http://localhost:8001/api/v1/heartbeat" 2
    if !errorlevel! EQU 0 exit /b 0
    timeout /t 1 /nobreak >nul
)
exit /b 1

:is_container_running
set "CONTAINER_NAME=%~1"
set "RUNNING_STATE="
for /f "usebackq delims=" %%S in (`docker inspect -f "{{.State.Running}}" %CONTAINER_NAME% 2^>nul`) do set "RUNNING_STATE=%%S"
if /i "%RUNNING_STATE%"=="true" exit /b 0
exit /b 1

:clear_listener_on_api_port
powershell -NoProfile -Command "$port = %API_PORT%; $root = [regex]::Escape('%BACKEND_DIR%'); $listeners = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match $root -and $_.CommandLine -match 'uvicorn\s+src\.main:app' }; $killed = $false; foreach($p in $listeners){ try{ Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop; $killed = $true } catch{} }; Start-Sleep -Milliseconds 500; $left = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $port }; if($left){ foreach($conn in $left){ $pid = $conn.OwningProcess; $proc = Get-CimInstance Win32_Process -Filter ('ProcessId=' + $pid) -ErrorAction SilentlyContinue; if(-not $proc){ continue }; if($proc.CommandLine -match $root -and $proc.CommandLine -match 'uvicorn\s+src\.main:app'){ try { Stop-Process -Id $pid -Force -ErrorAction Stop; $killed = $true } catch{} } else { Write-Output ('UNMANAGED:' + $pid) } }; Start-Sleep -Milliseconds 300; $left2 = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $port }; if($left2){ foreach($conn in $left2){ $pid = $conn.OwningProcess; $proc = Get-CimInstance Win32_Process -Filter ('ProcessId=' + $pid) -ErrorAction SilentlyContinue; if($proc -and -not ($proc.CommandLine -match $root -and $proc.CommandLine -match 'uvicorn\s+src\.main:app')){ Write-Output ('UNMANAGED:' + $pid) } } } }; if($killed){ Write-Output 'KILLED_MANAGED' }" >"%BACKEND_DIR%\logs\port_clear.log" 2>&1
findstr /C:"UNMANAGED:" "%BACKEND_DIR%\logs\port_clear.log" >nul 2>&1
if %errorlevel% EQU 0 (
    echo [ERROR] Port %API_PORT% is occupied by a non-SocraticDev process. Stop it manually and retry.
    type "%BACKEND_DIR%\logs\port_clear.log"
    exit /b 1
)
exit /b 0

:check_http_url
set "CHECK_URL=%~1"
set "CHECK_TIMEOUT=%~2"
if not defined CHECK_TIMEOUT set "CHECK_TIMEOUT=2"
where curl.exe >nul 2>&1
if !errorlevel! NEQ 0 (
    exit /b 1
)
curl.exe -fsS --max-time %CHECK_TIMEOUT% "%CHECK_URL%" >nul 2>&1
set "CHECK_RC=!errorlevel!"
exit /b !CHECK_RC!

:check_api_signature
set "CHECK_TIMEOUT=%~1"
if not defined CHECK_TIMEOUT set "CHECK_TIMEOUT=2"
where curl.exe >nul 2>&1
if !errorlevel! NEQ 0 (
    exit /b 1
)
curl.exe -fsS --max-time %CHECK_TIMEOUT% "%API_BASE_URL%/openapi.json" | findstr /c:"/api/visualization/analyze" >nul 2>&1
set "CHECK_RC=!errorlevel!"
exit /b !CHECK_RC!

:recover_docker_infra
echo [INFO] Recovery step 1: restarting infrastructure containers...
call %COMPOSE_CMD% down --remove-orphans
call %COMPOSE_CMD% up -d --remove-orphans
if errorlevel 1 exit /b 1
call :wait_for_docker_health 90
if !errorlevel! EQU 0 exit /b 0

echo [WARNING] Recovery step 2: resetting Docker volumes for a clean state...
echo [WARNING] This clears local Neo4j/Chroma/Redis/Postgres/RabbitMQ data.
call %COMPOSE_CMD% down -v --remove-orphans
call %COMPOSE_CMD% up -d --remove-orphans
if errorlevel 1 exit /b 1
call :wait_for_docker_health 180
exit /b %errorlevel%

:backend_deps_up_to_date
if not exist "%BACKEND_DEPS_MARKER%" exit /b 1
if not exist "%BACKEND_REQ%" exit /b 1
powershell -NoProfile -Command "$m = Get-Item '%BACKEND_DEPS_MARKER%'; $r = Get-Item '%BACKEND_REQ%'; if($m.LastWriteTimeUtc -ge $r.LastWriteTimeUtc){ exit 0 } else { exit 1 }" >nul 2>&1
exit /b %errorlevel%

:fail
echo.
echo [ERROR] %~1
echo.
pause
exit /b 1
