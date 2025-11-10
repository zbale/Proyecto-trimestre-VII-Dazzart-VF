import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "@env";

const BASE = BACKEND_URL || "http://67.202.48.5:3001";
const API = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 10000,
});

export const imgUrl = (path) => {
  if (!path) return "";
  return `${BASE}/${path.replace(/^\/+/, "")}`;
};

API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      config.headers = config.headers || {};
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    } catch (error) {
      console.log("Error obteniendo token:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response && err.response.status === 401) {
      try { await AsyncStorage.removeItem("token"); } catch (e) {}
    }
    return Promise.reject(err);
  }
);

export default API;
