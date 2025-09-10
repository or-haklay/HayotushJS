import httpServices from "./httpServices";

const apiEndpoint = "/places";

// Flexible search that supports both the old and new parameter shapes
export async function searchPlaces(options = {}) {
  const {
    // New shape (used by Search screen)
    q,
    lat,
    lng,
    petCategory,
    category,
    radius,
    maxResults,
    sessionToken,
    rank,
    regionCode,
    languageCode,
    // Old shape (back-compat)
    query,
    location,
  } = options;

  const params = {};

  // Query text
  if (q || query) params.q = q ?? query;

  // Location
  const latitude = lat ?? location?.latitude;
  const longitude = lng ?? location?.longitude;
  if (latitude != null && longitude != null) {
    params.lat = latitude;
    params.lng = longitude;
  }

  // Filters and options
  if (typeof maxResults !== "undefined") params.maxResults = maxResults;
  if (typeof radius !== "undefined") params.radius = radius;
  if (category) params.category = category;
  if (petCategory) params.petCategory = petCategory;
  if (sessionToken) params.sessionToken = sessionToken;
  if (rank) params.rank = rank;
  if (regionCode) params.regionCode = regionCode;
  if (languageCode) params.languageCode = languageCode;

  try {
    const { data } = await httpServices.get(`${apiEndpoint}/search`, {
      params,
    });

    // Surface backend-reported errors
    if (data && typeof data === "object" && data.error) {
      const errMessage =
        typeof data.error === "string" ? data.error : "Places search failed";
      const err = new Error(errMessage);
      err.response = { data };
      throw err;
    }

    // Ensure consistent object shape expected by screens (res.places)
    if (Array.isArray(data)) return { places: data };
    if (data && typeof data === "object" && Array.isArray(data.places)) {
      return { places: data.places };
    }
    return { places: [] };
  } catch (error) {
    console.error("❌ Places search failed:", error);
    console.error("❌ Error response:", error?.response?.data);
    throw error;
  }
}

// Details returns the raw object from backend (not wrapped in { place })
export async function getPlaceDetails(placeId, opts = {}) {
  try {
    const { sessionToken, languageCode, regionCode } = opts || {};
    const { data } = await httpServices.get(
      `${apiEndpoint}/details/${placeId}`,
      {
        params: { sessionToken, languageCode, regionCode },
      }
    );
    if (data && typeof data === "object" && data.error) {
      const errMessage =
        typeof data.error === "string" ? data.error : "Place details failed";
      const err = new Error(errMessage);
      err.response = { data };
      throw err;
    }
    return data ?? null;
  } catch (error) {
    console.error("❌ Get place details failed:", error);
    throw error;
  }
}

// Helper to build a relative photo URL that the Details screen can absolutize
export function getPhotoUrl(name, maxWidthPx = 800) {
  if (!name) return null;
  return `${apiEndpoint}/photo?name=${encodeURIComponent(
    name
  )}&maxWidthPx=${maxWidthPx}`;
}

// The following helpers are kept for potential future use. They point to
// endpoints that may not exist yet on the backend.
export async function getNearbyPlaces({
  location,
  radius = 5000,
  category,
  maxResults = 20,
}) {
  const params = {
    lat: location.latitude,
    lng: location.longitude,
    radius,
    maxResults,
  };
  if (category) params.category = category;
  const { data } = await httpServices.get(`${apiEndpoint}/nearby`, { params });
  return data?.places ?? [];
}

export async function getPlacePhotos(placeId, maxPhotos = 5) {
  const { data } = await httpServices.get(`${apiEndpoint}/photos/${placeId}`, {
    params: { maxPhotos },
  });
  return data?.photos ?? [];
}

export async function getPlaceReviews(placeId, maxReviews = 10) {
  const { data } = await httpServices.get(`${apiEndpoint}/reviews/${placeId}`, {
    params: { maxReviews },
  });
  return data?.reviews ?? [];
}

// Default export for existing imports (placesService.*)
export default {
  searchPlaces,
  getPlaceDetails,
  getPhotoUrl,
  getNearbyPlaces,
  getPlacePhotos,
  getPlaceReviews,
};
