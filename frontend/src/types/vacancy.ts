export type VacancyStatus = "open" | "paused" | "closed";

export interface Vacancy {
  id: string;
  title: string;
  department: string;
  status: VacancyStatus;
  statusLabel: string;
  openedLabel: string;
  owner: string;
  inPipeline: number;
  inInterview: number | null;
}

export type PipelineStageId = "applied" | "screening" | "interview" | "offer" | "closed";

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  total: number;
  cards: PipelineCard[];
  moreCount: number;
}

export interface PipelineCard {
  candidateId: string;
  name: string;
  initials: string;
  note: string;
  score: number | null;
}