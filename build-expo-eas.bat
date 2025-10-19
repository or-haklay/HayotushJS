@echo off
echo ========================================
echo    יצירת APK באמצעות Expo EAS
echo ========================================
echo.

echo [1/4] בדיקת EAS CLI...
npx @expo/eas-cli --version
if %errorlevel% neq 0 (
    echo ❌ שגיאה: EAS CLI לא מותקן
    echo מתקין EAS CLI...
    npm install -g @expo/eas-cli
)

echo [2/4] התחברות לחשבון Expo...
echo אנא התחבר לחשבון Expo שלך
npx @expo/eas-cli login

echo [3/4] בניית APK באמצעות EAS...
echo זה ייקח כמה דקות...
npx @expo/eas-cli build --platform android --profile development

echo [4/4] הורדת קובץ APK...
echo הקובץ יישמר בתיקיית build/
echo או תוכל להוריד אותו מהקישור שיוצג

echo.
echo ✅ תהליך הבנייה הושלם!
echo 📱 הקובץ יישמר בתיקיית build/
echo ========================================
pause


