import { siteConfig } from "@/config";
import { getToken, removeToken, setToken } from "@/lib/access-token";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { AuthAPI } from "./api/auth.api";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: siteConfig.backend.base_headers,
});

// Thêm request interceptor để tự động gắn JWT token vào headers
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error(`[API] Request error:`, error);
    return Promise.reject(error);
  }
);

// Tự động đăng nhập khi gặp lỗi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 500 && error.response.data?.message === "API C360 báo lỗi: Invalid token") {
      console.log(`[API] Token expired, attempting to refresh...`);
      try {
        const res = await AuthAPI.login({
          UserName: "mapsapi",
          Password: "123456",
        });
        if (res.Token) {
          setToken(res.Token);
          return api.request(error.config);
        }
      } catch (refreshError) {
        console.error(`[API] Token refresh failed:`, refreshError);
        removeToken();
      }
      return Promise.reject(error);
    }
  }
);

export const apiGet = async <ResponseData = unknown>(
  endpoint: string,
  config?: AxiosRequestConfig
) => api.get<ResponseData>(endpoint, config);

export const apiPost = async <PostData = unknown, ResponseData = unknown>(
  endpoint: string,
  data: PostData,
  config?: AxiosRequestConfig
) =>
  api.post<ResponseData, AxiosResponse<ResponseData>>(endpoint, data, config);

export const apiDelete = async <ResponseData = unknown>(
  endpoint: string,
  config?: AxiosRequestConfig
) => api.delete<ResponseData>(endpoint, config);

export default api;
