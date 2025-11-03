# הגדרת סביבת Build מקומית לאנדרואיד

## דרישות מערכת
- ✅ Windows 10/11
- ✅ 24GB RAM (יש לך!)
- ✅ 20GB פנויים בדיסק
- ✅ Ryzen AI 7 (יש לך!)

## שלב 1: הפעל Long Paths (חובה!)

1. לחץ לחיצה ימנית על `enable-long-paths.ps1`
2. בחר **"Run with PowerShell"** או **"הפעל עם PowerShell"**
3. אם תתבקש, לחץ **"Yes"** / **"כן"** להרשאות מנהל
4. **אתחל את המחשב!** (חובה!)

## שלב 2: התקן Android Studio

1. הורד מ: https://developer.android.com/studio
2. התקן עם ההגדרות הדיפולטיביות
3. פתח Android Studio
4. במסך הפתיחה לחץ **More Actions > SDK Manager**
5. התקן:
   - ✅ Android SDK 36 (API Level 36)
   - ✅ Android SDK Build-Tools 36.0.0
   - ✅ NDK (Side by side) - גרסה 27.1.12297006

## שלב 3: התקן Java 17

### אופציה א' - דרך Android Studio (מומלץ):
1. Android Studio > Settings > Build, Execution, Deployment > Build Tools > Gradle
2. תחת "Gradle JDK" בחר **"Download JDK..."**
3. בחר **JDK 17** ולחץ Download

### אופציה ב' - התקנה ידנית:
1. הורד Java 17 מ: https://adoptium.net/
2. התקן והוסף ל-PATH

## שלב 4: הגדר משתני סביבה

1. לחץ Windows + R
2. הקלד: `sysdm.cpl` ולחץ Enter
3. לשונית **Advanced** > **Environment Variables**
4. הוסף/ערוך:

```
ANDROID_HOME = C:\Users\[שם המשתמש]\AppData\Local\Android\Sdk
JAVA_HOME = [נתיב ל-Java 17]
```

5. הוסף ל-PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

## שלב 5: בדוק התקנה

פתח PowerShell וודא:

```bash
java -version        # צריך להראות Java 17
adb version         # צריך להראות Android Debug Bridge
```

## שלב 6: בנה את האפליקציה!

פשוט הפעל:
```bash
build-local.bat
```

או ידנית:
```bash
cd android
.\gradlew.bat assembleRelease
```

## זמני Build צפויים

- **בניה ראשונה:** 15-25 דקות
- **בניות עוקבות:** 3-7 דקות

## איפה ה-APK?

```
android/app/build/outputs/apk/release/app-release.apk
```

## בעיות נפוצות

### בעיה: "SDK location not found"
**פתרון:** צור קובץ `android/local.properties`:
```
sdk.dir=C:\\Users\\[שם המשתמש]\\AppData\\Local\\Android\\Sdk
```

### בעיה: "JAVA_HOME is not set"
**פתרון:** הגדר JAVA_HOME במשתני סביבה (שלב 4)

### בעיה: "Filename longer than 260 characters"
**פתרון:** ודא שהפעלת Long Paths ואתחלת את המחשב!

### בעיה: Out of Memory
**פתרון:** כבר תוקן! יש לך 8GB זיכרון ל-Gradle

## אופטימיזציות נוספות

ב-`android/gradle.properties` כבר הוגדר:
```properties
org.gradle.jvmargs=-Xmx8192m -XX:MaxMetaspaceSize=2048m
org.gradle.parallel=true
org.gradle.caching=true
```

זה מנצל את ה-24GB RAM שלך!

---

## מוכן? 🚀

1. ✅ הפעל `enable-long-paths.ps1` **כמנהל**
2. ✅ **אתחל מחשב**
3. ✅ התקן Android Studio + SDK 36 + NDK
4. ✅ הרץ `build-local.bat`

**בהצלחה!** 🎉


