export const routes = {
  root: "/",
  projects: "/projects",
  projectDetail: (projectId: string) => `/project/${projectId}/detail`,
}