import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const TOKEN_KEY = "servicesetu_access_token";

export const tokenStorage = {
  get() {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const extractApiData = (response) => response?.data?.data;

export const extractApiMessage = (response) =>
  response?.data?.message || "Request completed";

export default api;
