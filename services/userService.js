// services/userService.js
import httpServices from "./httpServices";
import authService from "./authService";

export async function getMe() {
  try {
    const { data } = await httpServices.get("/users/me");
    return data?.user ?? data;
  } catch (e) {
    // Fallback אם אין /me
    if (e?.response?.status === 404) {
      const id = await authService.getUserId();
      const { data } = await httpServices.get(`/users/${id}`);
      return data?.user ?? data;
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

export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await httpServices.post("/users/change-password", {
    currentPassword,
    newPassword,
  });
  return data;
}

export default { getMe, updateMe, changePassword };
