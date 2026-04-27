# Docker Push Fix Script - Removes Proxy Configuration
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Docker Push TLS Timeout Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check current Docker proxy configuration
Write-Host "[1] Checking current Docker proxy configuration..." -ForegroundColor Yellow
$dockerInfo = docker info 2>&1 | Out-String
$hasProxy = $dockerInfo -match "HTTP Proxy|HTTPS Proxy"

if ($hasProxy) {
    Write-Host "   [FOUND] Docker is using a proxy:" -ForegroundColor Yellow
    $proxyLines = docker info 2>&1 | Select-String -Pattern "Proxy|No Proxy"
    foreach ($line in $proxyLines) {
        Write-Host "      $line" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "[2] SOLUTION: Disable proxy in Docker Desktop" -ForegroundColor Green
    Write-Host ""
    Write-Host "To fix the TLS timeout issue:" -ForegroundColor White
    Write-Host "1. Open Docker Desktop" -ForegroundColor Cyan
    Write-Host "2. Click the Settings (gear) icon" -ForegroundColor Cyan
    Write-Host "3. Go to: Resources -> Proxies" -ForegroundColor Cyan
    Write-Host "4. UNCHECK 'Manual proxy configuration'" -ForegroundColor Cyan
    Write-Host "5. Click 'Apply & Restart'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[3] Alternative: Set environment variables for this session" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run these commands in PowerShell:" -ForegroundColor White
    Write-Host '  $env:HTTP_PROXY=""' -ForegroundColor Green
    Write-Host '  $env:HTTPS_PROXY=""' -ForegroundColor Green
    Write-Host '  $env:NO_PROXY="localhost,127.0.0.1"' -ForegroundColor Green
    Write-Host '  docker push mahdi157/protienlab-frontend:latest' -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "   [OK] No proxy configuration detected" -ForegroundColor Green
    Write-Host ""
    Write-Host "[2] Since no proxy is configured, the issue might be:" -ForegroundColor Yellow
    Write-Host "   - Network connectivity issues" -ForegroundColor White
    Write-Host "   - Firewall blocking Docker Hub" -ForegroundColor White
    Write-Host "   - VPN interference" -ForegroundColor White
    Write-Host ""
    Write-Host "[3] Try these solutions:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Solution A: Increase timeout and retry" -ForegroundColor Cyan
    Write-Host '  $env:DOCKER_CLIENT_TIMEOUT="300"' -ForegroundColor Green
    Write-Host '  docker push mahdi157/protienlab-frontend:latest' -ForegroundColor Green
    Write-Host ""
    Write-Host "Solution B: Try pushing with verbose output" -ForegroundColor Cyan
    Write-Host '  docker push --debug mahdi157/protienlab-frontend:latest' -ForegroundColor Green
    Write-Host ""
    Write-Host "Solution C: Check if you're logged in" -ForegroundColor Cyan
    Write-Host '  docker login' -ForegroundColor Green
    Write-Host '  docker push mahdi157/protienlab-frontend:latest' -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Script completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan










