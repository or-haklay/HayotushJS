# תיקון בעיית API URL - תיעוד

## 🔴 הבעיה המקורית

האפליקציה לא שלחה בקשות HTTP לשרת לאחר התקנת ה-APK במכשיר.

## 🔍 הסיבה

**הקוד לא השתמש ב-URL שהוגדר ב-`app.json`!**

במקום זאת, היו URL-ים קשיחים (hardcoded) בקבצי הקוד:

### 1. קובץ `services/httpServices.js`

```javascript
// ❌ לפני התיקון:
const API_URL = "http://192.168.1.141:3000/api";
```

### 2. קובץ `services/socialService.js`

```javascript
// ❌ לפני התיקון:
const API_BASE_URL = "http://192.168.1.141:3000/api"; // URL מקומי
```

### 3. בנוסף: Android חוסם HTTP

Android 9+ חוסם בקשות HTTP (לא מאובטחות) כברירת מחדל. זה גרם לחסימה נוספת של הבקשות.

## ✅ הפתרון

### שלב 1: עדכון קבצי ה-Services

**`services/httpServices.js`:**
```javascript
// ✅ אחרי התיקון:
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || "https://api.hayotush.com/api";

console.log("🔗 API URL:", API_URL);
```

**`services/socialService.js`:**
```javascript
// ✅ אחרי התיקון:
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || "https://api.hayotush.com/api";
```

### שלב 2: הוספת הרשאה ל-HTTP ב-Android

**`android/app/src/main/AndroidManifest.xml`:**
```xml
<application
  ...
  android:usesCleartextTraffic="true">
```

**הערה:** זה נחוץ רק אם משתמשים ב-HTTP. עם HTTPS (מומלץ), זה לא נדרש אבל גם לא מפריע.

### שלב 3: וידוא שה-URL מוגדר נכון ב-`app.json`

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_URL": "https://api.hayotush.com/api"
    }
  }
}
```

## 📱 תוצאה

עכשיו האפליקציה:
1. ✅ קוראת את ה-API URL מ-`app.json` דרך `Constants.expoConfig.extra`
2. ✅ משתמשת ב-HTTPS (מאובטח)
3. ✅ שולחת בקשות לשרת הנכון: `https://api.hayotush.com/api`
4. ✅ תומכת ב-fallback ל-URL ברירת מחדל אם ה-config לא זמין

## 🎯 לקחים

1. **אל תשתמשו ב-hardcoded URLs** - תמיד קראו אותם מקובץ קונפיגורציה
2. **השתמשו ב-HTTPS** - זה יותר מאובטח וממילא הדרישה של Android
3. **השתמשו ב-Constants.expoConfig** - זו הדרך הנכונה לקרוא הגדרות מ-`app.json` ב-Expo
4. **הוסיפו fallback** - במקרה שה-config לא זמין, יהיה ערך ברירת מחדל

## 📁 קבצים שעודכנו

1. ✅ `services/httpServices.js` - עודכן להשתמש ב-`Constants.expoConfig`
2. ✅ `services/socialService.js` - עודכן להשתמש ב-`Constants.expoConfig`
3. ✅ `android/app/src/main/AndroidManifest.xml` - נוסף `usesCleartextTraffic="true"`
4. ✅ `app.json` - ה-URL עודכן ל-HTTPS

## 🚀 שימוש עתידי

מעכשיו, כדי לשנות את ה-API URL:

1. ערוך את `app.json`:
   ```json
   "extra": {
     "EXPO_PUBLIC_API_URL": "https://your-new-api.com/api"
   }
   ```

2. בנה APK חדש:
   ```bash
   cd android
   .\gradlew.bat assembleRelease
   ```

3. זהו! האפליקציה תשתמש ב-URL החדש אוטומטית.

---

**תאריך תיקון:** נובמבר 2025  
**גרסת אפליקציה:** 1.0.1

