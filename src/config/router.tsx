import { routes } from "@/config";
import { MainLayout } from "@/layouts";
import { MapPreviewPage, ProjectDetailPage, ProjectPage } from "@/pages";
import { Navigate, type RouteObject } from "react-router-dom";

export const reactRouter: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      {
        path: routes.root,
        element: <Navigate to={routes.projects} />,
      },
      {
        path: routes.projects,
        element: <ProjectPage />,
      },
      {
        path: routes.projectDetail(":projectId"),
        element: <ProjectDetailPage />,
      },
      {
        path: routes.mapPreview(":projectId"),
        element: <MapPreviewPage />,
      }
    ],
  },

  // FALLBACK 404 ROUTER
  { path: "*", element: <div>Not Found Error Page's</div> },
]