// src/theme/theme.ts

/**
 * פלטת הצבעים הראשית של האפליקציה, מבוססת על הלוגו והפילוסופיה העיצובית.
 * כל צבע נבחר כדי לעורר רגש ספציפי של ביטחון, חום וניקיון.
 */
// פלטת צבעים למצב בהיר
const lightColors = {
  primary: "#017A82", // כחול-ירקרק (Teal)
  accent: "#FFC107", // חרדל-זהב (Mustard)
  neutral: "#546E7A", // אפור קר (Cool Gray)
  background: "#F8F9FA", // לבן-שמנת (Off-White)
  surface: "#FFFFFF", // צבע פני שטח
  card: "#FFFFFF", // צבע כרטיסיות
  text: "#212121", // צבע טקסט ראשי
  textSecondary: "#757575", // צבע טקסט משני
  border: "#E0E0E0", // צבע גבול
  shadow: "#000000", // צבע צל

  // צבעים שימושיים נוספים
  white: "#FFFFFF",
  black: "#212121",
  error: "#D32F2F", // אדום לשגיאות
  success: "#388E3C", // ירוק להצלחה
  warning: "#FF9800", // כתום לאזהרות
  info: "#2196F3", // כחול למידע
  disabled: "#BDBDBD", // אפור לכפתורים לא פעילים

  // צבעים על רקעים
  onPrimary: "#FFFFFF", // צבע טקסט על primary
  onSecondary: "#212121", // צבע טקסט על secondary
  onSurface: "#212121", // צבע טקסט על surface
  onBackground: "#212121", // צבע טקסט על background
  onError: "#FFFFFF", // צבע טקסט על error
  onSuccess: "#FFFFFF", // צבע טקסט על success
  onWarning: "#FFFFFF", // צבע טקסט על warning
  onInfo: "#FFFFFF", // צבע טקסט על info
  onDisabled: "#757575", // צבע טקסט על disabled
  onNeutral: "#FFFFFF", // צבע טקסט על neutral
  onAccent: "#212121", // צבע טקסט על accent
  onDark: "#FFFFFF", // צבע טקסט על dark
  onWhite: "#212121", // צבע טקסט על white
  onBlack: "#FFFFFF", // צבע טקסט על black
  secondary: "#FFC107", // צבע משני (זהה ל-accent)

  // צבעים נוספים לאווטר תמונת פרופיל
  lightGray: "#F5F5F5", // אפור בהיר לרקע
  errorLight: "#FFEBEE", // אדום בהיר לרקע כפתור מחיקה
};

// פלטת צבעים למצב חשוך - נברשת טורקיזית כהה לחיותוש
const darkColors = {
  primary: "#00B8A9", // טורקיז בהיר שמתחבר ללוגו
  accent: "#FFD54F", // צהוב-זהב רך יותר
  neutral: "#334B4B", // כהה עם נגיעה טורקיזית
  background: "#0E1A1A", // טורקיז כהה מאוד, כמעט שחור
  surface: "#1A2A2A", // מעט בהיר יותר מהרקע הראשי
  card: "#1A2A2A", // רקע כרטיסים
  text: "#E0E0E0", // אפור בהיר לטקסט ראשי
  textSecondary: "#A0B0B0", // אפור-טורקיזי רך לטקסט משני
  border: "#263737", // גוון כהה מתון לגבולות
  shadow: "#000000", // צבע צל

  // צבעים שימושיים נוספים
  white: "#E0E0E0", // אפור בהיר לטקסט על רקע כהה
  black: "#000000",
  error: "#FF6F61", // אדום חם, רך ולא צורם
  success: "#81C784", // ירוק בהיר רגוע
  warning: "#FFD54F", // צהוב-זהב רך
  info: "#00B8A9", // טורקיז בהיר
  disabled: "#334B4B", // כהה עם נגיעה טורקיזית

  // צבעים על רקעים
  onPrimary: "#000000", // שחור על טורקיז בהיר
  onSecondary: "#000000", // שחור על צהוב-זהב
  onSurface: "#E0E0E0", // אפור בהיר על surface כהה
  onBackground: "#E0E0E0", // אפור בהיר על background כהה
  onError: "#FFFFFF", // לבן על אדום
  onSuccess: "#FFFFFF", // לבן על ירוק
  onWarning: "#000000", // שחור על צהוב-זהב
  onInfo: "#FFFFFF", // לבן על טורקיז
  onDisabled: "#A0B0B0", // אפור-טורקיזי על disabled
  onNeutral: "#E0E0E0", // אפור בהיר על neutral
  onAccent: "#000000", // שחור על צהוב-זהב
  onDark: "#E0E0E0", // אפור בהיר על dark
  onWhite: "#000000", // שחור על white
  onBlack: "#E0E0E0", // אפור בהיר על black
  secondary: "#FFD54F", // צהוב-זהב רך

  // צבעים נוספים לאווטר תמונת פרופיל
  lightGray: "#263737", // גוון כהה מתון לרקע
  errorLight: "#4A1A1A", // אדום כהה יותר לרקע כפתור מחיקה
};

// פונקציה לקבלת צבעים לפי מצב
export const getColors = (isDark = false) => {
  return isDark ? darkColors : lightColors;
};

// צבעים ברירת מחדל (מצב בהיר)
export const COLORS = lightColors;

export const FONTS = {
  h1: {
    fontFamily: "Rubik",
    fontSize: 28,
    fontWeight: "bold",
  },
  h2: {
    fontFamily: "Rubik",
    fontSize: 22,
    fontWeight: "bold",
  },
  h3: {
    fontFamily: "Rubik",
    fontSize: 18,
    fontWeight: "bold",
  },
  body: {
    fontFamily: "NotoSansHebrew",
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: "NotoSansHebrew",
    fontSize: 12,
  },

  // פונטים נוספים שחסרים בקומפוננטים
  regular: {
    fontFamily: "NotoSansHebrew",
    fontSize: 16,
    fontWeight: "normal",
  },
  medium: {
    fontFamily: "NotoSansHebrew",
    fontSize: 16,
    fontWeight: "500",
  },
  semiBold: {
    fontFamily: "NotoSansHebrew",
    fontSize: 16,
    fontWeight: "600",
  },
  bold: {
    fontFamily: "NotoSansHebrew",
    fontSize: 16,
    fontWeight: "bold",
  },
  text_medium: {
    fontFamily: "NotoSansHebrew",
    fontSize: 16,
    fontWeight: "500",
  },
  text_small: {
    fontFamily: "NotoSansHebrew",
    fontSize: 14,
    fontWeight: "normal",
  },
  text_large: {
    fontFamily: "NotoSansHebrew",
    fontSize: 18,
    fontWeight: "normal",
  },
};

/**
 * הגדרות גדלים וריווחים ליצירת עקביות ויזואלית.
 * מבוסס על יחידת בסיס של 8px.
 */
export const SIZING = {
  base: 8,
  padding: 16,
  margin: 16,

  pageMargin: "5%",

  // רדיוס פינות מעוגלות
  radius_sm: 8, // לכפתורים
  radius_md: 12, // לכרטיסיות
  radius_lg: 16, // לתיבות דו-שיח ולכרטיסיות גדולות
  radius_xl: 24, // לתיבות דו-שיח גדולות
  borderRadius: 12, // רדיוס פינות כללי
  radius_2xl: 32, // לתיבות דו-שיח גדולות מאוד
  radius_3xl: 48, // לתיבות דו-שיח גדולות מאוד

  // גדלי מסך (לעיצוב רספונסיבי בעתיד)
  width: null, // ייקבע דינמית
  height: null, // ייקבע דינמית

  // גדלים נוספים שחסרים בקומפוננטים
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,

  // ריווחים נוספים
  padding_xs: 4,
  padding_sm: 8,
  padding_md: 16,
  padding_lg: 24,
  padding_xl: 32,
  padding_2xl: 48,
  padding_3xl: 64,

  margin_xs: 4,
  margin_sm: 8,
  margin_md: 16,
  margin_lg: 24,
  margin_xl: 32,
  margin_2xl: 48,
  margin_3xl: 64,

  // גדלי טקסט
  text_small: 12,
  text_medium: 16,
  text_large: 18,
  text_xlarge: 24,

  // גדלי אייקונים
  icon_small: 16,
  icon_medium: 24,
  icon_large: 32,
  icon_xlarge: 48,

  // גדלי כפתורים
  button_height: 48,
  button_padding: 16,
  button_radius: 8,

  // גדלי כרטיסיות
  card_padding: 16,
  card_radius: 12,
  card_margin: 8,

  // גדלי רשימות
  list_item_height: 56,
  list_item_padding: 16,
  list_separator_height: 1,

  // גדלי מודלים
  modal_padding: 24,
  modal_radius: 16,
  modal_margin: 16,

  // גדלי טפסים
  input_height: 48,
  input_padding: 16,
  input_radius: 8,
  input_margin: 8,

  // גדלי ניווט
  tab_height: 60,
  tab_padding: 8,
  tab_radius: 24,

  // גדלי הודעות
  snackbar_height: 48,
  snackbar_padding: 16,
  snackbar_radius: 8,

  // גדלי לודרים
  loader_size: 24,
  loader_stroke: 2,

  // גדלי תמונות
  avatar_small: 32,
  avatar_medium: 48,
  avatar_large: 64,
  avatar_xlarge: 96,

  // גדלי צ'יפים
  chip_height: 32,
  chip_padding: 12,
  chip_radius: 16,

  // גדלי באדג'ים
  badge_size: 20,
  badge_radius: 10,
  badge_padding: 4,

  // גדלי פב
  fab_size: 56,
  fab_radius: 28,
  fab_padding: 16,

  // גדלי אייקונים בכפתורים
  button_icon_size: 24,
  button_icon_padding: 8,

  // גדלי אייקונים ברשימות
  list_icon_size: 24,
  list_icon_padding: 16,

  // גדלי אייקונים בכרטיסיות
  card_icon_size: 24,
  card_icon_padding: 8,

  // גדלי אייקונים בניווט
  tab_icon_size: 24,
  tab_icon_padding: 8,

  // גדלי אייקונים בטפסים
  form_icon_size: 20,
  form_icon_padding: 12,

  // גדלי אייקונים בהודעות
  message_icon_size: 24,
  message_icon_padding: 16,

  // גדלי אייקונים בלודרים
  loader_icon_size: 24,
  loader_icon_padding: 0,

  // גדלי אייקונים בתמונות
  image_icon_size: 24,
  image_icon_padding: 8,

  // גדלי אייקונים בצ'יפים
  chip_icon_size: 16,
  chip_icon_padding: 8,

  // גדלי אייקונים בבאדג'ים
  badge_icon_size: 12,
  badge_icon_padding: 2,

  // גדלי אייקונים בפב
  fab_icon_size: 24,
  fab_icon_padding: 16,
};
