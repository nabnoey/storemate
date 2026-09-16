import { TokenService } from "./token.service";
import axios from "axios";

import { store } from "../redux/store";
import { logout } from "../redux/auth/authReducer";

const baseURL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = TokenService.getAccessToken();

  if (
    token &&
    !config.url?.includes("login") &&
    !config.url?.includes("register") &&
    !config.url?.includes("forgot-password") &&
    !config.url?.includes("reset-password")
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginAPI = error.config.url?.includes("/login");
      if (!isLoginAPI) {
        TokenService.removeToken();
        store.dispatch(logout());
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
