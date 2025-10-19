# מדריך יצירת APK עבור Hayotush

## מה הוכן עבורך:

### 1. עדכון גרסאות ✅

- **app.json**: גרסה 1.0.1, versionCode 2
- **build.gradle**: גרסה 1.0.1, versionCode 2

### 2. הגדרת Keystore ✅

- הוגדר keystore: `@orhaklay__hayotush.jks`
- סיסמה: `hayotush2024`
- alias: `hayotush`

### 3. סקריפטים מוכנים ✅

- `build-expo-simple.bat` - יצירת APK באמצעות Expo (הכי פשוט) ⭐
- `build-expo-local.bat` - יצירת APK מקומי עם Expo
- `build-expo-eas.bat` - יצירת APK באמצעות EAS
- `build-apk.bat` - יצירת APK מקומי (Gradle)

## אפשרויות ליצירת APK:

### אפשרות 1: יצירת APK באמצעות Expo (הכי פשוט) ⭐

```bash
# הרץ את הסקריפט
build-expo-simple.bat
```

### אפשרות 2: יצירת APK מקומי עם Expo

```bash
# הרץ את הסקריפט
build-expo-local.bat
```

### אפשרות 3: יצירת APK באמצעות EAS

```bash
# הרץ את הסקריפט
build-expo-eas.bat
```

### אפשרות 4: יצירת APK ידנית

```bash
# 1. ניקוי
cd android
gradlew clean

# 2. בנייה
gradlew assembleRelease

# 3. הקובץ ייווצר ב:
# android/app/build/outputs/apk/release/app-release.apk
```

### אפשרות 5: יצירת APK באמצעות Expo CLI

```bash
# בנייה מקומית
npx expo run:android --variant release

# או בנייה עם EAS
npx @expo/eas-cli build --platform android --profile development --local
```

## מיקומי קבצים חשובים:

- **Keystore**: `@orhaklay__hayotush.jks`
- **APK מקומי**: `android/app/build/outputs/apk/release/app-release.apk`
- **APK EAS**: `build/` (אחרי בנייה)

## הגדרות חשובות:

### app.json

```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2,
      "package": "com.hayotush.app"
    }
  }
}
```

### build.gradle

```gradle
defaultConfig {
    versionCode 2
    versionName "1.0.1"
}

signingConfigs {
    release {
        storeFile file('../../@orhaklay__hayotush.jks')
        storePassword 'hayotush2024'
        keyAlias 'hayotush'
        keyPassword 'hayotush2024'
    }
}
```

## פתרון בעיות נפוצות:

### 1. שגיאת Keystore

- ודא שהקובץ `@orhaklay__hayotush.jks` קיים
- בדוק את הסיסמה: `hayotush2024`

### 2. שגיאת Gradle

- הרץ: `cd android && gradlew clean`
- הרץ: `cd android && gradlew assembleRelease`

### 3. שגיאת EAS

- התחבר: `npx @expo/eas-cli login`
- בדוק הגדרות: `npx @expo/eas-cli build:configure`

## המלצה:

השתמש ב-**אפשרות 1** (build-expo-simple.bat) ליצירה הכי פשוטה עם Expo! ⭐
