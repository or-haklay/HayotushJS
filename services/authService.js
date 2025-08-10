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
}

async function getJWT() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

async function logOut() {
  await setToken(null);
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
  return user ? user._id : null;
}

async function createUser(userData) {
  const response = await httpServices.post("/users", userData);
  return response.data;
}

async function login(email, password) {
  const { data } = await httpServices.post("/users/login", { email, password });

  await setToken(data.token);

  return data.token;
}

export default {
  setToken,
  getJWT,
  logOut,
  getUser,
  getUserId,
  createUser,
  login,
};
