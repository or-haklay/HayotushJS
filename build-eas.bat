@echo off
echo ========================================
echo    יצירת APK באמצעות EAS Build
echo ========================================
echo.

echo [1/3] בדיקת EAS CLI...
npx @expo/eas-cli --version
if %errorlevel% neq 0 (
    echo ❌ שגיאה: EAS CLI לא מותקן
    echo מתקין EAS CLI...
    npm install -g @expo/eas-cli
)

echo [2/3] התחברות לחשבון Expo...
echo אנא התחבר לחשבון Expo שלך
npx @expo/eas-cli login

echo [3/3] יצירת APK...
echo בוחר פרופיל development...
npx @expo/eas-cli build --platform android --profile development --local

echo.
echo ========================================
echo ✅ תהליך הבנייה הושלם!
echo 📱 הקובץ יישמר בתיקיית build/
echo ========================================
pause
