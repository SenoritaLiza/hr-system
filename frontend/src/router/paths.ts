export const PATHS = {
  dashboard: "/",
  vacancies: "/vacancies",
  vacancyPipeline: "/vacancies/:id",
  upload: "/upload",
  bulkUpload: "/upload/bulk",
  candidates: "/candidates",
  compare: "/candidates/compare",
  candidateResult: "/candidates/:id",
  candidateInvite: "/candidates/:id/invite",
  favorites: "/favorites",
  metrics: "/metrics",
  analytics: "/analytics",
  settings: "/settings",
  adminTeam: "/admin/team",
  adminSystem: "/admin/system",
  adminAudit: "/admin/audit",
  states: "/states",
} as const;

export const vacancyPipelinePath = (id: string) => `/vacancies/${id}`;
export const candidateResultPath = (id: string) => `/candidates/${id}`;
export const candidateInvitePath = (id: string) => `/candidates/${id}/invite`;