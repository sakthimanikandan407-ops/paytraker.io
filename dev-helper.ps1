# PayTrack V2 Development Helper Script
# This script provides common development tasks for the PayTrack project.

$SCRIPT_DIR = $PSScriptRoot
Set-Location $SCRIPT_DIR

function Write-Header {
    param([string]$Text)
    Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor White -BackgroundColor Blue
    Write-Host ("=" * 50) + "`n" -ForegroundColor Cyan
}

function Show-Menu {
    Clear-Host
    Write-Header "PayTrack V2 - Developer Control Center"
    Write-Host "1. Start Development Server (npm run dev)" -ForegroundColor Yellow
    Write-Host "2. Build Production Bundle (npm run build)" -ForegroundColor Yellow
    Write-Host "3. Clean and Reinstall Dependencies (Fresh Install)" -ForegroundColor Red
    Write-Host "4. Run Linting (npm run lint)" -ForegroundColor Yellow
    Write-Host "5. Preview Build (npm run preview)" -ForegroundColor Yellow
    Write-Host "6. Check Environment (Node/NPM/Supabase)" -ForegroundColor Green
    Write-Host "Q. Exit" -ForegroundColor Gray
    Write-Host "`nSelect an option: " -NoNewline
}

function Start-DevServer {
    Write-Header "Starting Development Server..."
    npm run dev
}

function Build-Release {
    Write-Header "Building Production Assets..."
    npm run build
}

function Clean-Install {
    Write-Header "CRITICAL: Cleaning Project..."
    Write-Host "Removing node_modules..." -ForegroundColor DarkGray
    if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
    
    Write-Host "Removing dist..." -ForegroundColor DarkGray
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
    
    Write-Host "Installing dependencies..." -ForegroundColor Green
    npm install
    Write-Host "Done!" -ForegroundColor Green
}

function Run-Lint {
    Write-Header "Running Linter..."
    npm run lint
}

function Preview-Build {
    Write-Header "Previewing Build..."
    npm run preview
}

function Check-Env {
    Write-Header "Checking Development Environment..."
    Write-Host "Node Version: " -NoNewline
    node -v
    Write-Host "NPM Version: " -NoNewline
    npm -v
    
    if (Get-Command "supabase" -ErrorAction SilentlyContinue) {
        Write-Host "Supabase CLI: " -NoNewline
        supabase --version
    } else {
        Write-Host "Supabase CLI not found. (Not required for UI development)" -ForegroundColor Gray
    }
}

# Main Logic
if ($args.Length -gt 0) {
    switch ($args[0]) {
        "dev" { Start-DevServer }
        "build" { Build-Release }
        "clean" { Clean-Install }
        "lint" { Run-Lint }
        "check" { Check-Env }
        default { Write-Host "Unknown command: $($args[0])" -ForegroundColor Red }
    }
} else {
    while ($true) {
        Show-Menu
        $input = Read-Host
        switch ($input) {
            "1" { Start-DevServer; Read-Host "Press Enter to continue..." }
            "2" { Build-Release; Read-Host "Press Enter to continue..." }
            "3" { Clean-Install; Read-Host "Press Enter to continue..." }
            "4" { Run-Lint; Read-Host "Press Enter to continue..." }
            "5" { Preview-Build; Read-Host "Press Enter to continue..." }
            "6" { Check-Env; Read-Host "Press Enter to continue..." }
            "Q" { exit }
            "q" { exit }
        }
    }
}
