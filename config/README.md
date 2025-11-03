# API Configuration

## Overview

האפליקציה משתמשת במשתנה סביבה אחד לבחירת שרת ה-API:
- **Production**: `https://api.hayotush.com/api`
- **Local Development**: `http://localhost:3000/api`

## Configuration

ההגדרה נמצאת ב-`app.json` תחת `expo.extra.EXPO_PUBLIC_API_URL`:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_URL": "https://api.hayotush.com/api"
    }
  }
}
```

## Usage

בכל מקום באפליקציה, ייבא את `API_URL` מ-`config/apiConfig.js`:

```javascript
import { API_URL } from '../config/apiConfig';

// Use API_URL in your requests
const response = await fetch(`${API_URL}/your-endpoint`);
```

## Changing the API Server

### For Local Development

ערוך את `app.json`:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_URL": "http://localhost:3000/api"
    }
  }
}
```

**Note**: יש לוודא שהשרת המקומי רץ על פורט 3000.

### For Production

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_URL": "https://api.hayotush.com/api"
    }
  }
}
```

## Files Using API_URL

הקבצים הבאים משתמשים ב-`API_URL`:
- `services/httpServices.js` - השירות הראשי ל-HTTP requests
- `services/socialService.js` - שירותים חברתיים (Google, etc.)
- `services/locationService.js` - שירותי מיקום ו-POIs
- `app/service/[id].jsx` - תמונות של מקומות
- `components/search/SearchResultCard.js` - תמונות של תוצאות חיפוש

## Important Notes

1. **אל תשתמש ב-hardcoded URLs** - תמיד ייבא מ-`config/apiConfig.js`
2. **לא צריך לבנות מחדש** - רק לערוך `app.json` ולהפעיל מחדש את האפליקציה
3. **Fallback**: אם `EXPO_PUBLIC_API_URL` לא מוגדר, ברירת המחדל היא `https://api.hayotush.com/api`

