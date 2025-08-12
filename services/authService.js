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
      httpServices.defaults.headers.common.Authorization = `Bearer ${token}`;
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
  return user ? user._id || user.id : null;
}

async function createUser(userData) {
  const { data } = await httpServices.post("/users", userData);
  // If backend returns token on signup, persist it
  if (data?.token) await setToken(data.token);
  return data;
}

async function login(email, password) {
  const { data } = await httpServices.post("/users/login", { email, password });
  // Expecting { token, user? }
  await setToken(data.token);
  return data.token; // keep original behavior (returns the token)
}

// Useful on app start: read token from storage and set Authorization header
async function refreshAuthHeaderFromStorage() {
  const token = await getJWT();
  if (token) {
    try {
      httpServices.defaults.headers.common.Authorization = `Bearer ${token}`;
    } catch {}
  }
  return token;
}
async function oauthLogin(provider, payload) {
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
