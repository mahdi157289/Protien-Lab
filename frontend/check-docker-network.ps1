# Docker Network and Proxy Diagnostic Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Docker Network and Proxy Diagnostic Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Docker daemon status
Write-Host "[1] Checking Docker daemon status..." -ForegroundColor Yellow
try {
    $dockerVersion = docker version --format '{{.Server.Version}}' 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Docker daemon is running (Version: $dockerVersion)" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Docker daemon is not running or not accessible" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   [ERROR] Cannot connect to Docker daemon" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Check Docker proxy configuration
Write-Host "[2] Checking Docker proxy configuration..." -ForegroundColor Yellow
$dockerInfo = docker info 2>&1 | Out-String
$hasProxy = $dockerInfo -match "HTTP Proxy|HTTPS Proxy"
$proxyReachable = $false

if ($hasProxy) {
    Write-Host "   [WARNING] Proxy configuration detected:" -ForegroundColor Yellow
    $proxyLines = docker info 2>&1 | Select-String -Pattern "Proxy|No Proxy"
    foreach ($line in $proxyLines) {
        Write-Host "      $line" -ForegroundColor Yellow
    }
    
    # Test proxy connectivity
    Write-Host ""
    Write-Host "   Testing proxy connectivity..." -ForegroundColor Yellow
    $proxyHost = "docker.internal"
    $proxyPort = 3128
    
    try {
        $testConnection = Test-NetConnection -ComputerName $proxyHost -Port $proxyPort -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if ($testConnection.TcpTestSucceeded) {
            Write-Host "   [OK] Proxy is reachable at $proxyHost`:$proxyPort" -ForegroundColor Green
            $proxyReachable = $true
        } else {
            Write-Host "   [ERROR] Proxy is NOT reachable at $proxyHost`:$proxyPort" -ForegroundColor Red
            Write-Host "   -> This is likely causing the TLS handshake timeout!" -ForegroundColor Red
        }
    } catch {
        Write-Host "   [ERROR] Cannot test proxy connectivity" -ForegroundColor Red
        Write-Host "   -> Proxy may be misconfigured!" -ForegroundColor Red
    }
} else {
    Write-Host "   [OK] No proxy configuration detected" -ForegroundColor Green
}
Write-Host ""

# 3. Test Docker Hub connectivity
Write-Host "[3] Testing Docker Hub connectivity..." -ForegroundColor Yellow
try {
    Write-Host "   Attempting to pull node:22 image..." -ForegroundColor Yellow
    $pullOutput = docker pull node:22 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Successfully connected to Docker Hub" -ForegroundColor Green
    } else {
        $errorMsg = $pullOutput | Select-String -Pattern "error|timeout|failed" -CaseSensitive:$false
        if ($errorMsg) {
            Write-Host "   [ERROR] Failed to connect to Docker Hub" -ForegroundColor Red
            Write-Host "   Error details: $errorMsg" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   [ERROR] Error testing Docker Hub: $_" -ForegroundColor Red
}
Write-Host ""

# 4. Check DNS resolution
Write-Host "[4] Checking DNS resolution..." -ForegroundColor Yellow
$domains = @("registry-1.docker.io", "auth.docker.io", "docker.io")
foreach ($domain in $domains) {
    try {
        $dnsResult = Resolve-DnsName -Name $domain -ErrorAction SilentlyContinue
        if ($dnsResult) {
            $ip = $dnsResult[0].IPAddress
            Write-Host "   [OK] $domain resolves to: $ip" -ForegroundColor Green
        } else {
            Write-Host "   [ERROR] Cannot resolve $domain" -ForegroundColor Red
        }
    } catch {
        Write-Host "   [ERROR] DNS resolution failed for $domain" -ForegroundColor Red
    }
}
Write-Host ""

# 5. Check internet connectivity
Write-Host "[5] Checking general internet connectivity..." -ForegroundColor Yellow
try {
    $pingResult = Test-Connection -ComputerName "8.8.8.8" -Count 2 -Quiet
    if ($pingResult) {
        Write-Host "   [OK] Internet connectivity is working" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Internet connectivity issues detected" -ForegroundColor Red
    }
} catch {
    Write-Host "   [ERROR] Cannot test internet connectivity" -ForegroundColor Red
}
Write-Host ""

# 6. Check Docker images cache
Write-Host "[6] Checking cached Docker images..." -ForegroundColor Yellow
$cachedImages = docker images --format "{{.Repository}}:{{.Tag}}" 2>&1
if ($cachedImages -and $cachedImages.Count -gt 0) {
    $nodeImages = $cachedImages | Select-String -Pattern "node"
    if ($nodeImages) {
        Write-Host "   [OK] Found cached Node images:" -ForegroundColor Green
        foreach ($img in $nodeImages) {
            Write-Host "      - $img" -ForegroundColor Green
        }
    } else {
        Write-Host "   [INFO] No Node images found in cache" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [INFO] No cached images found" -ForegroundColor Yellow
}
Write-Host ""

# Summary and Recommendations
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY AND RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($hasProxy -and -not $proxyReachable) {
    Write-Host "[ISSUE FOUND] Proxy configuration is blocking Docker Hub access" -ForegroundColor Red
    Write-Host ""
    Write-Host "RECOMMENDED FIX:" -ForegroundColor Yellow
    Write-Host "1. Open Docker Desktop" -ForegroundColor White
    Write-Host "2. Go to Settings -> Resources -> Proxies" -ForegroundColor White
    Write-Host "3. Disable 'Manual proxy configuration' or fix proxy settings" -ForegroundColor White
    Write-Host "4. Click 'Apply and Restart'" -ForegroundColor White
    Write-Host "5. Retry: docker pull node:22" -ForegroundColor White
} else {
    Write-Host "[OK] No obvious proxy issues detected" -ForegroundColor Green
    Write-Host ""
    Write-Host "If Docker Hub still fails, try:" -ForegroundColor Yellow
    Write-Host "- Restart Docker Desktop" -ForegroundColor White
    Write-Host "- Check firewall/VPN settings" -ForegroundColor White
    Write-Host "- Wait a few minutes and retry (Docker Hub may be temporarily down)" -ForegroundColor White
}

Write-Host ""
Write-Host "Script completed!" -ForegroundColor Cyan
