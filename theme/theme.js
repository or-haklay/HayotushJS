// src/theme/theme.js

/**
 * פלטת הצבעים הראשית של האפליקציה, מבוססת על הלוגו והפילוסופיה העיצובית.
 * כל צבע נבחר כדי לעורר רגש ספציפי של ביטחון, חום וניקיון.
 */
export const COLORS = {
  primary: "#017A82", // כחול-ירקרק (Teal)
  accent: "#FFC107", // חרדל-זהב (Mustard)
  neutral: "#546E7A", // אפור קר (Cool Gray)
  background: "#F8F9FA", // לבן-שמנת (Off-White)
  dark: "#132e36", // שחור כהה (Dark Charcoal)

  // צבעים שימושיים נוספים
  white: "#FFFFFF",
  black: "#212121",
  error: "#D32F2F", // אדום לשגיאות
  success: "#388E3C", // ירוק להצלחה
  disabled: "#BDBDBD", // אפור לכפתורים לא פעילים
};

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
};
