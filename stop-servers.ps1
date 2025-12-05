# PowerShell script to stop Swapp servers

Write-Host "🛑 Stopping Swapp servers..." -ForegroundColor Red

# Kill all Node.js processes
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "✅ Killed $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Green
} else {
    Write-Host "ℹ️ No Node.js processes found" -ForegroundColor Gray
}

# Also try killing specific ports
try {
    npx kill-port 5000 2>$null
    npx kill-port 5173 2>$null
} catch {
    # Ignore errors if kill-port not available
}

Write-Host "✅ All servers stopped successfully" -ForegroundColor Green
