@echo off
echo ========================================
echo    יצירת APK באמצעות Expo (פשוט)
echo ========================================
echo.

echo [1/3] בדיקת Expo CLI...
npx expo --version

echo [2/3] התקנת תלויות...
call npm install

echo [3/3] יצירת APK...
echo זה ייקח כמה דקות...
echo.

echo אפשרויות:
echo 1. בנייה מקומית (מהיר)
echo 2. בנייה באמצעות EAS (מומלץ)
echo 3. בנייה עם Expo Build
echo.

set /p choice="בחר אפשרות (1-3): "

if "%choice%"=="1" (
    echo בנייה מקומית...
    npx expo run:android --variant release
) else if "%choice%"=="2" (
    echo בנייה באמצעות EAS...
    npx @expo/eas-cli build --platform android --profile development
) else if "%choice%"=="3" (
    echo בנייה עם Expo Build...
    npx expo build:android
) else (
    echo בחירה לא תקינה
    goto :end
)

echo.
echo ✅ תהליך הבנייה הושלם!
echo ========================================
pause


