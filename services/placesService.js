import httpServices from "./httpServices";

const apiEndpoint = "/places";

export async function searchPlaces({
  query,
  location,
  category,
  petCategory,
  radius = 5000,
  maxResults = 20,
}) {
  const params = {};
  if (query) params.q = query;
  if (maxResults) params.maxResults = maxResults;

  if (location) {
    params.lat = location.latitude;
    params.lng = location.longitude;
  }

  if (category) {
    params.category = category;
  }

  if (petCategory) {
    params.petCategory = petCategory;
  }

  if (radius) {
    params.radius = radius;
  }

  try {
    const { data } = await httpServices.get(`${apiEndpoint}/search`, {
      params,
    });

    return data?.places ?? [];
  } catch (error) {
    console.error("❌ Places search failed:", error);
    console.error("❌ Error response:", error.response?.data);
    throw error;
  }
}

export async function getPlaceDetails(placeId) {
  try {
    const { data } = await httpServices.get(
      `${apiEndpoint}/details/${placeId}`
    );
    return data?.place || null;
  } catch (error) {
    console.error("❌ Get place details failed:", error);
    throw error;
  }
}

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

  if (category) {
    params.category = category;
  }

  try {
    const { data } = await httpServices.get(`${apiEndpoint}/nearby`, {
      params,
    });

    return data?.places ?? [];
  } catch (error) {
    console.error("❌ Nearby places search failed:", error);
    console.error("❌ Error response:", error.response?.data);
    throw error;
  }
}

export async function getPlacePhotos(placeId, maxPhotos = 5) {
  try {
    const { data } = await httpServices.get(
      `${apiEndpoint}/photos/${placeId}`,
      {
        params: { maxPhotos },
      }
    );
    return data?.photos ?? [];
  } catch (error) {
    console.error("❌ Get place photos failed:", error);
    throw error;
  }
}

export async function getPlaceReviews(placeId, maxReviews = 10) {
  try {
    const { data } = await httpServices.get(
      `${apiEndpoint}/reviews/${placeId}`,
      {
        params: { maxReviews },
      }
    );
    return data?.reviews ?? [];
  } catch (error) {
    console.error("❌ Get place reviews failed:", error);
    throw error;
  }
}
