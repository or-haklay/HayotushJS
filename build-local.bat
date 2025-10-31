@echo off
REM Local Android Build Script
REM This script builds the Android APK locally

echo ========================================
echo Hayotush Android Local Build
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "android\gradlew.bat" (
    echo Error: android\gradlew.bat not found!
    echo Make sure you're running this from the HayotushJS directory.
    pause
    exit /b 1
)

echo [1/3] Cleaning previous build...
cd android
call gradlew.bat clean
if %errorlevel% neq 0 (
    echo Error during clean!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Building Release APK...
echo This may take 15-25 minutes on first build...
echo.
call gradlew.bat assembleRelease
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo Build FAILED!
    echo ========================================
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo Build SUCCESSFUL!
echo ========================================
echo.
echo APK location:
echo %cd%\app\build\outputs\apk\release\app-release.apk
echo.

REM Go back to root directory
cd ..

echo [3/3] Opening output folder...
start "" "%cd%\android\app\build\outputs\apk\release"

echo.
echo Done! You can now install the APK on your device.
pause

