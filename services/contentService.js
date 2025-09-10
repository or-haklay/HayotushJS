import http from "./httpServices";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_IDX_KEY = "content.saved.index"; // JSON array of slugs
const savedKey = (slug) => `content.article.${slug}`;

export async function getCategories() {
  const { data } = await http.get("/content/categories");
  return data;
}

export async function getArticles({
  category,
  q,
  sort,
  page = 1,
  pageSize = 20,
}) {
  const params = new URLSearchParams();
  if (category) params.append("category", String(category));
  if (q) params.append("q", String(q));
  if (sort) params.append("sort", String(sort));
  params.append("page", String(page));
  params.append("pageSize", String(pageSize));
  const { data } = await http.get(`/content/articles?${params.toString()}`);
  return data;
}

export async function getArticle(slug) {
  const { data } = await http.get(
    `/content/articles/${encodeURIComponent(slug)}`
  );
  return data;
}

export async function trackRead(slug) {
  const { data } = await http.post("/content/track/read", { slug });
  return data;
}

export async function getHighlights(n = 5) {
  const { data } = await http.get(
    `/content/highlights?n=${encodeURIComponent(n)}`
  );
  return data;
}

async function getSavedIndex() {
  try {
    const v = await AsyncStorage.getItem(SAVED_IDX_KEY);
    return v ? JSON.parse(v) : [];
  } catch {
    return [];
  }
}

async function setSavedIndex(list) {
  try {
    await AsyncStorage.setItem(SAVED_IDX_KEY, JSON.stringify(list || []));
  } catch {}
}

export async function saveArticle(article) {
  if (!article?.slug) return;
  await AsyncStorage.setItem(savedKey(article.slug), JSON.stringify(article));
  const idx = await getSavedIndex();
  if (!idx.includes(article.slug)) {
    idx.push(article.slug);
    await setSavedIndex(idx);
  }
}

export async function removeSavedArticle(slug) {
  await AsyncStorage.removeItem(savedKey(slug));
  const idx = await getSavedIndex();
  const next = idx.filter((s) => s !== slug);
  await setSavedIndex(next);
}

export async function isArticleSaved(slug) {
  const idx = await getSavedIndex();
  return idx.includes(slug);
}

export async function getSavedArticle(slug) {
  try {
    const v = await AsyncStorage.getItem(savedKey(slug));
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

export default {
  getCategories,
  getArticles,
  getArticle,
  trackRead,
  getHighlights,
  saveArticle,
  removeSavedArticle,
  isArticleSaved,
  getSavedArticle,
};
