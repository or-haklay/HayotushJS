@echo off
REM Clean Build Script - מבטיח שהקוד העדכני נכלל ב-build
REM Usage: scripts\build-clean.bat

echo ========================================
echo    בנייה נקייה - כוללת את הקוד העדכני
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo שגיאה: לא נמצא package.json
    echo ודא שאתה מריץ את זה מתיקיית HayotushJS
    pause
    exit /b 1
)

echo [1/7] ניקוי Metro cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo Metro cache נוקה
) else (
    echo Metro cache כבר נקי
)

echo.
echo [2/7] ניקוי Expo cache...
if exist ".expo" (
    rmdir /s /q ".expo"
    echo Expo cache נוקה
) else (
    echo Expo cache כבר נקי
)

echo.
echo [3/7] ניקוי Android build cache...
cd android
if exist "app\build" (
    rmdir /s /q "app\build"
    echo Android app build נוקה
)
if exist "build" (
    rmdir /s /q "build"
    echo Android build נוקה
)
if exist ".gradle" (
    echo ניקוי Gradle cache...
    call gradlew clean --no-daemon
    echo Gradle cache נוקה
)
cd ..

echo.
echo [4/7] ניקוי node_modules cache...
if exist "node_modules" (
    echo לא מוחקים node_modules לשמור זמן...
    echo אם יש בעיות, אפשר להריץ: npm install
) else (
    echo node_modules לא קיים
)

echo.
echo [5/7] התקנת תלויות (אם צריך)...
call npm install
if %errorlevel% neq 0 (
    echo שגיאה בהתקנת תלויות!
    pause
    exit /b 1
)

echo.
echo [6/7] ניקוי Gradle מלא...
cd android
call gradlew clean --no-daemon
if %errorlevel% neq 0 (
    echo אזהרה: Gradle clean נכשל, ממשיך בכל זאת...
)
cd ..

echo.
echo [7/7] בניית APK עם הקוד העדכני...
echo זה ייקח 15-25 דקות...
echo.
cd android
call gradlew assembleRelease --no-daemon
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo Build נכשל!
    echo ========================================
    cd ..
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ========================================
echo Build הושלם בהצלחה!
echo ========================================
echo.
echo מיקום APK:
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo %cd%\android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo פותח את תיקיית הפלט...
    start "" "%cd%\android\app\build\outputs\apk\release"
) else (
    echo לא נמצא קובץ APK!
)

echo.
pause

