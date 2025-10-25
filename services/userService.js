// services/userService.js
import httpServices from "./httpServices";
import authService from "./authService";

export async function getMe() {
  try {
    const { data } = await httpServices.get("/users/me");
    return data?.user ?? data;
  } catch (e) {
    console.error("Error in getMe:", e);

    // אם השגיאה היא 401, לא ננסה fallback
    if (e?.response?.status === 401) {
      throw e;
    }

    // Fallback אם אין /me
    if (e?.response?.status === 404) {
      try {
        const id = await authService.getUserId();
        if (!id) {
          throw new Error("No user ID found");
        }
        const { data } = await httpServices.get(`/users/${id}`);
        return data?.user ?? data;
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        throw e; // Throw original error
      }
    }
    throw e;
  }
}

export async function updateMe(patch) {
  try {
    const { data } = await httpServices.patch("/users/me", patch);
    return data?.user ?? data;
  } catch (e) {
    if (e?.response?.status === 404) {
      const id = await authService.getUserId();
      const { data } = await httpServices.put(`/users/${id}`, patch);
      return data?.user ?? data;
    }
    throw e;
  }
}

// Alias לשמירה על תאימות לקוד הקיים
export async function updateProfile(patch) {
  return updateMe(patch);
}

export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await httpServices.post("/users/change-password", {
    currentPassword,
    newPassword,
  });
  return data;
}

export async function getConsentStatus() {
  try {
    const { data } = await httpServices.get("/users/consent-status");
    return data;
  } catch (error) {
    console.error("Error fetching consent status:", error);
    throw error;
  }
}

export async function updateConsent(termsAccepted, privacyAccepted) {
  try {
    const { data } = await httpServices.post("/users/update-consent", {
      termsAccepted,
      privacyAccepted,
    });
    return data;
  } catch (error) {
    console.error("Error updating consent:", error);
    throw error;
  }
}

export default {
  getMe,
  updateMe,
  updateProfile,
  changePassword,
  getConsentStatus,
  updateConsent,
};
