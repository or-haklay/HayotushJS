@echo off
chcp 65001 >nul
echo ========================================
echo    קבלת SHA-1 Fingerprint מ-Debug Keystore
echo    (לשימוש באמולטור)
echo ========================================
echo.

cd /d "%~dp0.."

set DEBUG_KEYSTORE=android\app\debug.keystore

if not exist "%DEBUG_KEYSTORE%" (
    echo ⚠️  לא נמצא debug.keystore
    echo    יוצר debug.keystore חדש...
    echo.
    
    keytool -genkey -v -keystore "%DEBUG_KEYSTORE%" -alias androiddebugkey -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
    
    if errorlevel 1 (
        echo ❌ שגיאה: לא ניתן ליצור debug.keystore
        echo    ודא ש-Java מותקן ו-JAVA_HOME מוגדר
        pause
        exit /b 1
    )
    
    echo ✅ נוצר debug.keystore חדש
    echo.
)

echo ✅ נמצא debug.keystore: %DEBUG_KEYSTORE%
echo.
echo מקבל SHA-1 fingerprint...
echo.

keytool -list -v -keystore "%DEBUG_KEYSTORE%" -alias androiddebugkey -storepass android | findstr /C:"SHA1:"

if errorlevel 1 (
    echo ❌ שגיאה: לא ניתן להריץ את keytool
    echo    ודא ש-Java מותקן ו-JAVA_HOME מוגדר
    pause
    exit /b 1
)

echo.
echo ========================================
echo הוסף את ה-SHA-1 ל-Google Cloud Console:
echo.
echo 1. פתח: https://console.cloud.google.com/apis/credentials
echo 2. בחר את הפרויקט: petapp-de09c
echo 3. מצא את Android OAuth Client:
echo    387230820014-7nq8eac3v8u107au3bb3firb33b3c8d6
echo 4. לחץ על העריכה (עיפרון)
echo 5. הוסף SHA-1 fingerprint (העתק מהפלט למעלה)
echo 6. Package name: com.hayotush.app
echo 7. שמור
echo.
echo ⚠️  חשוב: אחרי הוספת ה-SHA-1, תצטרך לבנות מחדש!
echo    הרץ: npm run android
echo ========================================
echo.

pause



