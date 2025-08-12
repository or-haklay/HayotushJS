// app/services/placesService.js
import http from "./httpServices"; // your axios wrapper with baseURL from config.json

const BASE = "/places"; // relative to API baseURL from config.json

export async function searchPlaces({
  q,
  petCategory,
  category,
  lat,
  lng,
  radius = 5000,
  sessionToken,
  rank = "relevance",
  maxResults = 20,
  regionCode = "IL",
  languageCode = "he",
}) {
  const params = {
    q,
    petCategory,
    category,
    lat,
    lng,
    radius,
    sessionToken,
    rank,
    maxResults,
    regionCode,
    languageCode,
  };
  const { data } = await http.get(`${BASE}/search`, { params });
  return data;
}

export async function getPlaceDetails(
  placeId,
  { sessionToken, languageCode = "he" } = {}
) {
  const { data } = await http.get(
    `${BASE}/details/${encodeURIComponent(placeId)}`,
    {
      params: {
        ...(sessionToken ? { sessionToken } : {}),
        languageCode,
        regionCode: "IL",
        languageCode: "he",
      },
    }
  );
  return data;
}

export function getPhotoUrl(photoName, maxWidthPx = 900) {
  if (!photoName) return null;
  // Return relative URL; when rendering <Image>, prepend config.URL if needed
  return `${BASE}/photo?name=${encodeURIComponent(
    photoName
  )}&maxWidthPx=${maxWidthPx}`;
}

export default { searchPlaces, getPlaceDetails, getPhotoUrl };
