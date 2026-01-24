# GraphRAG System Stop Script (PowerShell)
# This script stops all backend services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GraphRAG System - Shutting Down" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Stopping backend services..." -ForegroundColor Yellow
Set-Location backend
docker-compose down
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend services stopped" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to stop backend services" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All services stopped successfully!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Frontend stops automatically when you press Ctrl+C" -ForegroundColor Yellow
