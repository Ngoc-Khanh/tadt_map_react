import { siteConfig } from "@/config";
import { getToken, getTokenFromUrl } from "@/lib/access-token";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: siteConfig.backend.base_headers,
});

// Thêm request interceptor để tự động gắn JWT token vào headers
api.interceptors.request.use(
  async (config) => {
    let token = getTokenFromUrl();
    token = token || getToken();
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log(`[API] Token expired, attempting to refresh...`);
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

export default api;
