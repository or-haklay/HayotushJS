@echo off
REM Clean EAS Build Script - מבטיח שהקוד העדכני נכלל ב-build
REM Usage: scripts\build-eas-clean.bat [profile]

echo ========================================
echo    בנייה נקייה עם EAS - כוללת את הקוד העדכני
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ שגיאה: לא נמצא package.json
    echo ודא שאתה מריץ את זה מתיקיית HayotushJS
    pause
    exit /b 1
)

set "PROFILE=production"
if not "%~1"=="" set "PROFILE=%~1"

echo [1/6] בדיקת EAS CLI...
npx @expo/eas-cli --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ EAS CLI לא מותקן
    echo מתקין EAS CLI...
    npm install -g @expo/eas-cli
    if %errorlevel% neq 0 (
        echo ❌ שגיאה בהתקנת EAS CLI!
        pause
        exit /b 1
    )
)

echo.
echo [2/6] ניקוי Metro cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ Metro cache נוקה
) else (
    echo ℹ️ Metro cache כבר נקי
)

echo.
echo [3/6] ניקוי Expo cache...
if exist ".expo" (
    rmdir /s /q ".expo"
    echo ✅ Expo cache נוקה
) else (
    echo ℹ️ Expo cache כבר נקי
)

echo.
echo [4/6] ניקוי Android build cache...
if exist "android\app\build" (
    rmdir /s /q "android\app\build"
    echo ✅ Android app build נוקה
)
if exist "android\build" (
    rmdir /s /q "android\build"
    echo ✅ Android build נוקה
)

echo.
echo [5/6] התקנת תלויות (אם צריך)...
call npm install
if %errorlevel% neq 0 (
    echo ❌ שגיאה בהתקנת תלויות!
    pause
    exit /b 1
)

echo.
echo [6/6] בנייה עם EAS - פרופיל: %PROFILE%
echo זה ייקח זמן...
echo.
echo ℹ️ אם אתה רוצה build מקומי, הוסף --local
echo ℹ️ אם אתה רוצה build בענן, השאר את זה בלי --local
echo.

choice /C YN /M "האם אתה רוצה build מקומי (Y) או בענן (N)"
if errorlevel 2 (
    echo.
    echo 🔨 בנייה בענן עם EAS...
    npx @expo/eas-cli build --platform android --profile %PROFILE% --clear-cache
) else (
    echo.
    echo 🔨 בנייה מקומית עם EAS...
    npx @expo/eas-cli build --platform android --profile %PROFILE% --local --clear-cache
)

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo ❌ Build נכשל!
    echo ========================================
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo ✅ Build הושלם בהצלחה!
echo ========================================
echo.
pause

