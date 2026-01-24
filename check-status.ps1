# GraphRAG System Status Check Script (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GraphRAG System - Status Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Docker Status:" -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "  ✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Docker is not running" -ForegroundColor Red
}

# Check Node.js
Write-Host "`nNode.js Status:" -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not installed" -ForegroundColor Red
}

# Check backend services
Write-Host "`nBackend Services:" -ForegroundColor Yellow
Set-Location backend
$services = docker-compose ps --services 2>$null
if ($services) {
    foreach ($service in $services) {
        $status = docker-compose ps $service 2>$null | Select-String "Up"
        if ($status) {
            Write-Host "  ✓ $service is running" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $service is not running" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ✗ No services running" -ForegroundColor Red
}
Set-Location ..

# Check API health
Write-Host "`nAPI Health:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ API is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ API is not responding" -ForegroundColor Red
}

# Check frontend
Write-Host "`nFrontend:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ Frontend is running" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Frontend is not running" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Status Check Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
