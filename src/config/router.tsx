import { routes } from "@/config";
import { MainLayout } from "@/layouts";
import { Navigate, type RouteObject } from "react-router-dom";

export const reactRouter: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      {
        path: routes.root,
        element: <Navigate to={routes.project} />,
      },
      {
        path: routes.project,
        element: <div>test</div>,
      },
      {
        path: routes.projectDetail(":projectId"),
        element: <div>Project Detail Page</div>,
      }
    ],
  },

  // FALLBACK 404 ROUTER
  { path: "*", element: <div>Not Found Error Page's</div> },
]