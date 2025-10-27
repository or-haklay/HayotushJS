// services/authService.js
// Auth helpers: login, signup, JWT storage, and helpers to read the current user.

import httpServices from "./httpServices";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "token";

async function setToken(token) {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  // Keep Authorization header on httpServices in sync (best-effort)
  try {
    if (token) {
      httpServices.defaults.headers.common.Authorization = token;
    } else {
      delete httpServices.defaults.headers.common.Authorization;
    }
  } catch {
    // ignore if httpServices doesn't expose defaults (non-axios impl, etc.)
  }
}

async function getJWT() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

async function logout() {
  await setToken(null);
}

// Backward-compat alias (some code may call logOut)
async function logOut() {
  return logout();
}

async function getUser() {
  try {
    const token = await getJWT();
    return token ? jwtDecode(token) : null;
  } catch {
    return null;
  }
}

async function getUserId() {
  const user = await getUser();
  return user ? user._id || user.id || null : null;
}

async function createUser(userData) {
  try {
    const { data } = await httpServices.post("/users", userData);

    // If backend returns token on signup, persist it
    if (data?.token) {
      await setToken(data.token);
    } else {
    }

    return data;
  } catch (error) {
    console.error("🔍 Error creating user:", error); // 🆕 הוסף את זה
    throw error;
  }
}

async function login(email, password) {
  try {
    const { data } = await httpServices.post("/users/login", {
      email,
      password,
    });

    // Expecting { token, user? }
    if (data && data.token) {
      await setToken(data.token);
      return data.token; // keep original behavior (returns the token)
    } else {
      throw new Error("No token received from server");
    }
  } catch (error) {
    console.error("Login service error:", error);
    throw error;
  }
}

// Useful on app start: read token from storage and set Authorization header
async function refreshAuthHeaderFromStorage() {
  const token = await getJWT();
  if (token) {
    try {
      httpServices.defaults.headers.common.Authorization = token;
    } catch {}
  }
  return token;
}

async function oauthLogin(provider, payload) {
  console.log("🔍 oauthLogin called with:", { provider, payload });
  console.log("🔍 Payload keys:", Object.keys(payload));
  console.log("🔍 redirectUri value:", payload.redirectUri);

  // Force clientId for Google OAuth - Use Web Client ID
  if (provider === "google") {
    payload.clientId =
      "387230820014-mc1s8vkumvl98m3e5s82qlevuhfetk3d.apps.googleusercontent.com";
    // Use the redirectUri from the request
    if (!payload.redirectUri) {
      console.error("❌ Missing redirectUri in OAuth request");
      throw new Error("Missing redirectUri");
    }
    console.log("🔧 Forced clientId in authService:", payload.clientId);
  }

  console.log("🔍 Final payload before sending:", {
    code: payload.code ? payload.code.substring(0, 20) + "..." : "missing",
    redirectUri: payload.redirectUri,
    clientId: payload.clientId,
    state: payload.state ? payload.state.substring(0, 20) + "..." : "missing",
  });

  const { data } = await httpServices.post(`/auth/${provider}`, payload);
  await setToken(data.token);
  return data.token;
}

export default {
  setToken,
  getJWT,
  logout,
  logOut, // alias
  getUser,
  getUserId,
  createUser,
  login,
  refreshAuthHeaderFromStorage,
  oauthLogin,
};
