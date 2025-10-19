@echo off
echo ========================================
echo    יצירת קובץ APK עבור Hayotush
echo ========================================
echo.

echo [1/4] ניקוי קבצים קודמים...
cd android
if exist "app\build" rmdir /s /q "app\build"
if exist "build" rmdir /s /q "build"
cd ..

echo [2/4] התקנת תלויות...
call npm install

echo [3/4] בניית APK...
cd android
call gradlew clean
call gradlew assembleRelease
cd ..

echo [4/4] העתקת קובץ APK...
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    copy "android\app\build\outputs\apk\release\app-release.apk" "Hayotush-v1.0.1.apk"
    echo.
    echo ✅ קובץ APK נוצר בהצלחה!
    echo 📁 מיקום: Hayotush-v1.0.1.apk
    echo 📱 גרסה: 1.0.1 (versionCode: 2)
) else (
    echo ❌ שגיאה: לא ניתן למצוא את קובץ APK
    echo בדוק את הלוגים למעלה לפרטים נוספים
)

echo.
echo ========================================
pause
