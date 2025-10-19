@echo off
echo ========================================
echo    יצירת APK באמצעות Expo (מקומי)
echo ========================================
echo.

echo [1/4] בדיקת Expo CLI...
npx expo --version
if %errorlevel% neq 0 (
    echo ❌ שגיאה: Expo CLI לא מותקן
    echo מתקין Expo CLI...
    npm install -g @expo/cli
)

echo [2/4] התקנת תלויות...
call npm install

echo [3/4] בניית APK מקומי...
echo זה ייקח כמה דקות...
npx expo run:android --variant release

echo [4/4] העתקת קובץ APK...
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    copy "android\app\build\outputs\apk\release\app-release.apk" "Hayotush-Expo-v1.0.1.apk"
    echo.
    echo ✅ קובץ APK נוצר בהצלחה!
    echo 📁 מיקום: Hayotush-Expo-v1.0.1.apk
    echo 📱 גרסה: 1.0.1 (versionCode: 2)
) else (
    echo ❌ שגיאה: לא ניתן למצוא את קובץ APK
    echo בדוק את הלוגים למעלה לפרטים נוספים
)

echo.
echo ========================================
pause


