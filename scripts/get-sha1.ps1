# PowerShell script to get SHA-1 fingerprint from keystore
# Usage: .\scripts\get-sha1.ps1

param(
    [string]$KeystorePath = "@orhaklay__hayotush.jks",
    [string]$Alias = "hayotush",
    [string]$StorePassword = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   קבלת SHA-1 Fingerprint מה-Keystore" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$keystoreFullPath = Join-Path $PSScriptRoot "..\$KeystorePath"

if (-not (Test-Path $keystoreFullPath)) {
    Write-Host "❌ שגיאה: לא ניתן למצוא את קובץ ה-keystore" -ForegroundColor Red
    Write-Host "   נתיב: $keystoreFullPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ נמצא קובץ keystore: $keystoreFullPath" -ForegroundColor Green
Write-Host ""

if ([string]::IsNullOrEmpty($StorePassword)) {
    Write-Host "אנא הזן את סיסמת ה-keystore:" -ForegroundColor Yellow
    $securePassword = Read-Host -AsSecureString
    $StorePassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    )
}

Write-Host "מקבל SHA-1 fingerprint..." -ForegroundColor Yellow
Write-Host ""

try {
    # Get SHA-1 using keytool
    $keytoolCommand = "keytool -list -v -keystore `"$keystoreFullPath`" -alias $Alias -storepass $StorePassword"
    
    $output = cmd /c $keytoolCommand 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ שגיאה: לא ניתן להריץ את keytool" -ForegroundColor Red
        Write-Host "   ודא ש-Java מותקן ושה-JAVA_HOME מוגדר" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "אם ה-alias לא נכון, נסה את האפשרויות הבאות:" -ForegroundColor Yellow
        Write-Host "   - hayotush" -ForegroundColor White
        Write-Host "   - key0" -ForegroundColor White
        Write-Host "   - upload" -ForegroundColor White
        Write-Host ""
        Write-Host "הרץ:" -ForegroundColor Yellow
        Write-Host "   .\scripts\get-sha1.ps1 -Alias <alias-name>" -ForegroundColor White
        exit 1
    }
    
    # Extract SHA-1 from output
    $sha1Match = [regex]::Match($output, "SHA1:\s*([A-F0-9:]+)", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $sha256Match = [regex]::Match($output, "SHA256:\s*([A-F0-9:]+)", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    
    if ($sha1Match.Success) {
        $sha1 = $sha1Match.Groups[1].Value
        Write-Host "✅ SHA-1 Fingerprint:" -ForegroundColor Green
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
        Write-Host "✅ SHA-256 Fingerprint:" -ForegroundColor Green
        Write-Host "   $sha256" -ForegroundColor White
        Write-Host ""
        
        # Copy to clipboard if possible
        try {
            Set-Clipboard -Value $sha256
            Write-Host "✅ SHA-256 הועתק ל-clipboard" -ForegroundColor Green
        } catch {
            Write-Host "ℹ️ לא ניתן להעתיק ל-clipboard אוטומטית" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "הוסף את ה-SHA-1 ל-Google Cloud Console:" -ForegroundColor Yellow
    Write-Host "1. https://console.cloud.google.com/apis/credentials" -ForegroundColor White
    Write-Host "2. בחר את הפרויקט: petapp-de09c" -ForegroundColor White
    Write-Host "3. מצא את Android OAuth Client: 387230820014-7nq8eac3v8u107au3bb3firb33b3c8d6" -ForegroundColor White
    Write-Host "4. הוסף SHA-1 עם Package name: com.hayotush.app" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ שגיאה: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

