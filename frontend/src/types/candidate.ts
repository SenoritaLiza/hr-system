export interface ExplanationFactor {
  label: string;
  weight: number;
}

export interface LlmTraits {
  careerConsistency: number;
  seniorityMatch: number;
  clarity: number;
  flags: string[];
}

export interface ModelScores {
  lr: number;
  rf: number;
  catboost: number;
}

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  position: string;
  vacancyTitle: string;
  vacancyId: string;
  experienceYears: number;
  score: number;
  favorite: boolean;
  dateLabel: string;
  email: string;
  education: string;
  seniority: string;
  skills: string[];
  softSkills: string[];
  llm: LlmTraits;
  modelScores: ModelScores;
  positiveFactors: ExplanationFactor[];
  negativeFactors: ExplanationFactor[];
  note?: string;
}