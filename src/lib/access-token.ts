import { siteConfig } from "@/config";

const isValidToken = (token: string): boolean => {
  if (!token || token.length < 10) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  if (parts[0].length < 10 || parts[1].length < 10) return false;
  return true;
};

const cleanInvalidTokenFromUrl = () => {
  const url = new URL(window.location.href);
  const tokenParam = url.searchParams.get(siteConfig.auth.params_token);
  if (tokenParam && !isValidToken(tokenParam)) {
    url.searchParams.delete(siteConfig.auth.params_token);
    window.history.replaceState({}, '', url.toString());
    return false;
  }
  return true;
};

export const getToken = () => {
  cleanInvalidTokenFromUrl();
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get(siteConfig.auth.params_token);
  if (tokenFromUrl && isValidToken(tokenFromUrl)) {
    setToken(tokenFromUrl);
    return tokenFromUrl;
  }
  return localStorage.getItem(siteConfig.auth.jwt_key) || "";
};

export const setToken = (token: string) => {
  if (isValidToken(token)) localStorage.setItem(siteConfig.auth.jwt_key, token);
};

export const removeToken = () => localStorage.removeItem(siteConfig.auth.jwt_key);

export const getTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get(siteConfig.auth.params_token) || "";
  return isValidToken(token) ? token : "";
};

export const addTokenToPath = (path: string) => {
  const token = getToken();
  if (token && isValidToken(token)) return `${path}?${siteConfig.auth.params_token}=${token}`;
  return path;
};

export const removeTokenFromUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete(siteConfig.auth.params_token);
  window.history.replaceState({}, '', url.toString());
};