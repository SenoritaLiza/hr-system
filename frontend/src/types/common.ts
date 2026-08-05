export type Role = "recruiter" | "admin";

export type CandidateStatus = "good" | "warning" | "critical";

export interface Person {
  name: string;
  initials: string;
}