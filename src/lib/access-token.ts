import { siteConfig } from "@/config";

export const getToken = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get(siteConfig.auth.params_token);
  if (tokenFromUrl) {
    // Lưu token từ URL vào localStorage để sử dụng sau này
    setToken(tokenFromUrl);
    return tokenFromUrl;
  }
  
  return localStorage.getItem(siteConfig.auth.jwt_key) || "";
};

export const setToken = (token: string) => localStorage.setItem(siteConfig.auth.jwt_key, token);
export const removeToken = () => localStorage.removeItem(siteConfig.auth.jwt_key);

export const getTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(siteConfig.auth.params_token) || "";
};

export const addTokenToPath = (path: string) => {
  const token = getToken();
  if (token) return `${path}?${siteConfig.auth.params_token}=${token}`;
  return path;
}