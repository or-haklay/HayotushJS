@echo off
chcp 65001 >nul
echo ========================================
echo    הרצת האפליקציה על אמולטור Android
echo ========================================
echo.

cd /d "%~dp0.."

echo בודק אם אמולטור פועל...
adb devices
echo.

echo 🚀 מפעיל את האפליקציה...
echo.

if "%1"=="--clear" (
    echo 🧹 מריץ עם ניקוי קאש...
    call npm run start:clear
) else if "%1"=="--build" (
    echo 🔨 מריץ build מלא...
    call npm run android
) else (
    call npm start
)

if errorlevel 1 (
    echo.
    echo ❌ שגיאה: הרצת האפליקציה נכשלה
    echo.
    echo טיפים:
    echo 1. ודא שהאמולטור פועל: adb devices
    echo 2. נסה עם ניקוי קאש: run-emulator.bat --clear
    echo 3. נסה build מלא: run-emulator.bat --build
    pause
    exit /b 1
)

pause



