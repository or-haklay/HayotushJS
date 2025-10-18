// scripts/verify-assets.mjs
import fs from "node:fs";
import path from "node:path";

const ROOTS = ["assets"]; // הוסף פה תיקיות נוספות אם צריך, למשל: "app/assets"
const EXTS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".bmp",
  ".heic",
]);

const toKey = (relNoExt) => relNoExt.replace(/[\\/ ]/g, "_").toLowerCase(); // בדיוק כמו שמתקמפל ל-resources באנדרואיד

const map = new Map();

function walk(dir, rootAbs) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, rootAbs);
    else {
      const ext = path.extname(p).toLowerCase();
      if (!EXTS.has(ext)) continue;
      const relFromRoot = path.relative(rootAbs, p);
      const relNoExt = relFromRoot.replace(/\.[^.]+$/i, "");
      const key = toKey(relNoExt);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }
  }
}

let scanned = 0;
for (const root of ROOTS) {
  const abs = path.resolve(process.cwd(), root);
  if (!fs.existsSync(abs)) continue;
  scanned++;
  walk(abs, abs);
}

if (!scanned) {
  console.log(`ℹ️ No asset roots found (${ROOTS.join(", ")}). Skipping.`);
  process.exit(0);
}

// הדפס כפילויות (אותו שם-בסיס) והחזר קוד שגיאה
let duplicates = 0;
for (const [key, files] of map.entries()) {
  if (files.length > 1) {
    duplicates++;
    console.log(`\n---- DUPLICATE ASSET BASENAME: ${key} ----`);
    for (const f of files) console.log(f);
  }
}

if (duplicates > 0) {
  console.error(
    `\n❌ Found ${duplicates} duplicate asset basenames (case-insensitive). ` +
      `השאר רק קובץ אחד לכל שם-בסיס (או שנה שמות בסיס שונים).`
  );
  process.exit(2);
}

console.log("✅ No duplicate asset basenames found.");
