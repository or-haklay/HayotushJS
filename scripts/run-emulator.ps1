# PowerShell script to run the app on Android emulator
# Usage: .\scripts\run-emulator.ps1 [--clear] [--build]

param(
    [switch]$Clear = $false,
    [switch]$Build = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   הרצת האפליקציה על אמולטור Android" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the project root directory
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Check if adb is available
Write-Host "בודק התקנת ADB..." -ForegroundColor Yellow
$adbPath = Get-Command adb -ErrorAction SilentlyContinue

if (-not $adbPath) {
    # Try to find adb in common Android SDK locations
    $possiblePaths = @(
        "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
        "$env:ANDROID_HOME\platform-tools\adb.exe",
        "$env:USERPROFILE\AppData\Local\Android\Sdk\platform-tools\adb.exe"
    )
    
    $adbFound = $false
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $env:PATH += ";$(Split-Path -Parent $path)"
            $adbFound = $true
            Write-Host "✅ נמצא ADB: $path" -ForegroundColor Green
            break
        }
    }
    
    if (-not $adbFound) {
        Write-Host "❌ שגיאה: לא נמצא ADB" -ForegroundColor Red
        Write-Host "   ודא ש-Android SDK מותקן ו-ANDROID_HOME מוגדר" -ForegroundColor Yellow
        Write-Host "   או הוסף את platform-tools ל-PATH" -ForegroundColor Yellow
        exit 1
    }
}

# Check if emulator is running
Write-Host ""
Write-Host "בודק אם אמולטור פועל..." -ForegroundColor Yellow
$devices = adb devices 2>&1
$emulatorRunning = $devices | Select-String -Pattern "emulator-\d+" -Quiet

if (-not $emulatorRunning) {
    Write-Host "⚠️  לא נמצא אמולטור פועל" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "אפשרויות:" -ForegroundColor Cyan
    Write-Host "1. פתח Android Studio > Device Manager והפעל אמולטור ידנית" -ForegroundColor White
    Write-Host "2. או הרץ: emulator -avd <שם_אמולטור>" -ForegroundColor White
    Write-Host ""
    
    $response = Read-Host "האם להמשיך בכל זאת? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "בוטל" -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✅ נמצא אמולטור פועל" -ForegroundColor Green
    $deviceInfo = adb devices -l
    Write-Host $deviceInfo -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 מתקין dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ שגיאה: התקנת dependencies נכשלה" -ForegroundColor Red
        exit 1
    }
}

# Determine which command to run
$command = "start"
if ($Build) {
    Write-Host "🔨 מריץ build מלא..." -ForegroundColor Yellow
    $command = "android"
} elseif ($Clear) {
    Write-Host "🧹 מריץ עם ניקוי קאש..." -ForegroundColor Yellow
    $command = "start:clear"
}

Write-Host ""
Write-Host "🚀 מפעיל את האפליקציה..." -ForegroundColor Green
Write-Host "   פקודה: npm run $command" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Run the app
if ($command -eq "android") {
    npm run android
} elseif ($command -eq "start:clear") {
    npm run start:clear
} else {
    npm start
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ שגיאה: הרצת האפליקציה נכשלה" -ForegroundColor Red
    Write-Host ""
    Write-Host "טיפים לפתרון בעיות:" -ForegroundColor Yellow
    Write-Host "1. ודא שהאמולטור פועל: adb devices" -ForegroundColor White
    Write-Host "2. נסה עם ניקוי קאש: .\scripts\run-emulator.ps1 -Clear" -ForegroundColor White
    Write-Host "3. נסה build מלא: .\scripts\run-emulator.ps1 -Build" -ForegroundColor White
    exit 1
}



