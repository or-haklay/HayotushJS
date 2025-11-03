@echo off
REM Batch script to get SHA-1 fingerprint from keystore
REM Usage: scripts\get-sha1.bat [alias] [password]

setlocal enabledelayedexpansion

echo ========================================
echo    קבלת SHA-1 Fingerprint מה-Keystore
echo ========================================
echo.

set "KEYSTORE_PATH=@orhaklay__hayotush.jks"
set "ALIAS=hayotush"

if not "%~1"=="" set "ALIAS=%~1"

set "KEYSTORE_FULL_PATH=%~dp0..\%KEYSTORE_PATH%"

if not exist "!KEYSTORE_FULL_PATH!" (
    echo ❌ שגיאה: לא ניתן למצוא את קובץ ה-keystore
    echo    נתיב: !KEYSTORE_FULL_PATH!
    exit /b 1
)

echo ✅ נמצא קובץ keystore: !KEYSTORE_FULL_PATH!
echo.

set "STORE_PASSWORD=%~2"
if "!STORE_PASSWORD!"=="" (
    echo אנא הזן את סיסמת ה-keystore:
    set /p STORE_PASSWORD="Password: "
)

echo מקבל SHA-1 fingerprint...
echo.

REM Try to get SHA-1
keytool -list -v -keystore "!KEYSTORE_FULL_PATH!" -alias !ALIAS! -storepass !STORE_PASSWORD! 2>nul

if errorlevel 1 (
    echo.
    echo ❌ שגיאה: לא ניתן להריץ את keytool
    echo    ודא ש-Java מותקן ושה-JAVA_HOME מוגדר
    echo.
    echo אם ה-alias לא נכון, נסה את האפשרויות הבאות:
    echo    - hayotush
    echo    - key0
    echo    - upload
    echo.
    echo הרץ:
    echo    scripts\get-sha1.bat ^<alias-name^> [password]
    exit /b 1
)

echo.
echo ========================================
echo הוסף את ה-SHA-1 ל-Google Cloud Console:
echo 1. https://console.cloud.google.com/apis/credentials
echo 2. בחר את הפרויקט: petapp-de09c
echo 3. מצא את Android OAuth Client: 387230820014-7nq8eac3v8u107au3bb3firb33b3c8d6
echo 4. הוסף SHA-1 עם Package name: com.hayotush.app
echo ========================================
echo.

pause

