# PowerShell script to start Swapp servers
# Run this script from the project root directory

Write-Host "🧹 Killing any existing server processes..." -ForegroundColor Yellow

# Force kill all Node.js processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Also try killing specific ports
try {
    npx kill-port 5000 2>$null
    npx kill-port 5173 2>$null
} catch {
    # Ignore errors if kill-port not available
}

# Wait a moment for processes to die
Start-Sleep -Seconds 2

Write-Host "🔄 Starting backend server..." -ForegroundColor Cyan
Set-Location -Path "Backend"
Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow

Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "🚀 Starting frontend server..." -ForegroundColor Green
Set-Location -Path "..\Frontend"
Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow

Write-Host "✅ Servers starting up!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "💡 Tip: Use .\stop-servers.ps1 to stop all servers" -ForegroundColor Gray

Set-Location -Path ".."
