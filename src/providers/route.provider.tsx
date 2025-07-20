import { reactRouter } from "@/config";
import { getToken, removeTokenFromUrl } from "@/lib/access-token";
import { useEffect } from "react";
import { createBrowserRouter, RouterProvider as RouterProviderRC } from "react-router-dom";

const TokenUrlHandler = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const handleTokenInUrl = () => {
      const token = getToken();
      if (!token) removeTokenFromUrl();
    };
    handleTokenInUrl();
    const handlePopState = () => {
      setTimeout(handleTokenInUrl, 0);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return <>{children}</>;
};

export default function RouterProvider() {
  const router = createBrowserRouter(reactRouter);
  return (
    <TokenUrlHandler>
      <RouterProviderRC router={router} />
    </TokenUrlHandler>
  );
}