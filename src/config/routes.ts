import { addTokenToPath } from "@/lib/access-token";

export const routes = {
  root: "/",
  projects: "/projects",
  projectDetail: (projectId: string) => `/project/${projectId}/detail`,
  mapPreview: (projectId: string) => `/project/${projectId}/map-preview`,
}

export const getRouteWithToken = (path: string) => addTokenToPath(path);