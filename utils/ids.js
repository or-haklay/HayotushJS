// utils/ids.js
export function isObjectId(str) {
  if (!str || typeof str !== "string") return false;
  return /^[0-9a-fA-F]{24}$/.test(str);
}
