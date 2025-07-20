import { getToken } from "@/lib/access-token";
import { useLocation, useNavigate } from "react-router-dom";

export const useTokenUrl = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const addTokenToUrl = (path: string) => {
    const token = getToken();
    const url = new URL(path, window.location.origin);
    if (token) url.searchParams.set("token", token);
    return url.pathname + url.search;
  };

  const navigateWithToken = (path: string) => {
    navigate(addTokenToUrl(path));
  }

  const getCurrentUrlWithToken = () => {
    return addTokenToUrl(location.pathname);
  }

  return {
    addTokenToUrl,
    navigateWithToken,
    getCurrentUrlWithToken,
  }
}