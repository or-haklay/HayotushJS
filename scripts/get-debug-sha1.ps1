# PowerShell script to get SHA-1 fingerprint from debug keystore (for emulator)
# Usage: .\scripts\get-debug-sha1.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   קבלת SHA-1 Fingerprint מ-Debug Keystore" -ForegroundColor Cyan
Write-Host "   (לשימוש באמולטור)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if debug keystore exists
$debugKeystorePath = Join-Path $PSScriptRoot "..\android\app\debug.keystore"

if (-not (Test-Path $debugKeystorePath)) {
    Write-Host "⚠️  לא נמצא debug.keystore" -ForegroundColor Yellow
    Write-Host "   יוצר debug.keystore חדש..." -ForegroundColor Yellow
    Write-Host ""
    
    # Try to find keytool
    $keytoolPath = Get-Command keytool -ErrorAction SilentlyContinue
    if (-not $keytoolPath) {
        # Try common Java locations
        $javaHome = $env:JAVA_HOME
        if ($javaHome) {
            $possibleKeytool = Join-Path $javaHome "bin\keytool.exe"
            if (Test-Path $possibleKeytool) {
                $keytoolPath = $possibleKeytool
            }
        }
    }
    
    if (-not $keytoolPath) {
        Write-Host "❌ שגיאה: לא נמצא keytool" -ForegroundColor Red
        Write-Host "   ודא ש-Java מותקן ו-JAVA_HOME מוגדר" -ForegroundColor Yellow
        exit 1
    }
    
    # Create debug keystore
    $keytoolExe = if ($keytoolPath -is [System.Management.Automation.ApplicationInfo]) {
        $keytoolPath.Source
    } else {
        $keytoolPath
    }
    
    $keystoreDir = Split-Path -Parent $debugKeystorePath
    if (-not (Test-Path $keystoreDir)) {
        New-Item -ItemType Directory -Path $keystoreDir -Force | Out-Null
    }
    
    $createCommand = "`"$keytoolExe`" -genkey -v -keystore `"$debugKeystorePath`" -alias androiddebugkey -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname `"CN=Android Debug,O=Android,C=US`""
    
    Write-Host "מריץ: $createCommand" -ForegroundColor Gray
    cmd /c $createCommand
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ שגיאה: לא ניתן ליצור debug.keystore" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ נוצר debug.keystore חדש" -ForegroundColor Green
    Write-Host ""
}

Write-Host "✅ נמצא debug.keystore: $debugKeystorePath" -ForegroundColor Green
Write-Host ""

# Get SHA-1
Write-Host "מקבל SHA-1 fingerprint..." -ForegroundColor Yellow
Write-Host ""

try {
    $keytoolPath = Get-Command keytool -ErrorAction SilentlyContinue
    if (-not $keytoolPath) {
        $javaHome = $env:JAVA_HOME
        if ($javaHome) {
            $possibleKeytool = Join-Path $javaHome "bin\keytool.exe"
            if (Test-Path $possibleKeytool) {
                $keytoolPath = $possibleKeytool
            }
        }
    }
    
    if (-not $keytoolPath) {
        Write-Host "❌ שגיאה: לא נמצא keytool" -ForegroundColor Red
        exit 1
    }
    
    $keytoolExe = if ($keytoolPath -is [System.Management.Automation.ApplicationInfo]) {
        $keytoolPath.Source
    } else {
        $keytoolPath
    }
    
    # Get SHA-1 using keytool
    $keytoolCommand = "`"$keytoolExe`" -list -v -keystore `"$debugKeystorePath`" -alias androiddebugkey -storepass android"
    
    $output = cmd /c $keytoolCommand 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ שגיאה: לא ניתן להריץ את keytool" -ForegroundColor Red
        Write-Host "Output: $output" -ForegroundColor Yellow
        exit 1
    }
    
    # Extract SHA-1 from output
    $sha1Match = [regex]::Match($output, "SHA1:\s*([A-F0-9:]+)", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $sha256Match = [regex]::Match($output, "SHA256:\s*([A-F0-9:]+)", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    
    if ($sha1Match.Success) {
        $sha1 = $sha1Match.Groups[1].Value
        Write-Host "✅ SHA-1 Fingerprint (Debug):" -ForegroundColor Green
        Write-Host "   $sha1" -ForegroundColor White
        Write-Host ""
        
        # Copy to clipboard if possible
        try {
            Set-Clipboard -Value $sha1
            Write-Host "✅ SHA-1 הועתק ל-clipboard" -ForegroundColor Green
        } catch {
            Write-Host "ℹ️ לא ניתן להעתיק ל-clipboard אוטומטית" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ שגיאה: לא ניתן למצוא SHA-1 ב-output" -ForegroundColor Red
        Write-Host "Output:" -ForegroundColor Yellow
        Write-Host $output
        exit 1
    }
    
    if ($sha256Match.Success) {
        $sha256 = $sha256Match.Groups[1].Value
        Write-Host "✅ SHA-256 Fingerprint (Debug):" -ForegroundColor Green
        Write-Host "   $sha256" -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "הוסף את ה-SHA-1 ל-Google Cloud Console:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. פתח: https://console.cloud.google.com/apis/credentials" -ForegroundColor White
    Write-Host "2. בחר את הפרויקט: petapp-de09c" -ForegroundColor White
    Write-Host "3. מצא את Android OAuth Client:" -ForegroundColor White
    Write-Host "   387230820014-7nq8eac3v8u107au3bb3firb33b3c8d6" -ForegroundColor Cyan
    Write-Host "4. לחץ על העריכה (עיפרון)" -ForegroundColor White
    Write-Host "5. הוסף SHA-1 fingerprint:" -ForegroundColor White
    Write-Host "   $sha1" -ForegroundColor Cyan
    Write-Host "6. Package name: com.hayotush.app" -ForegroundColor White
    Write-Host "7. שמור" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  חשוב: אחרי הוספת ה-SHA-1, תצטרך לבנות מחדש את האפליקציה!" -ForegroundColor Yellow
    Write-Host "   הרץ: npm run android" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ שגיאה: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}



