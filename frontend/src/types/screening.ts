export interface ExplanationFactor {
  label: string;
  weight: number;
}

export interface CandidateScreeningResult {
  id: string;
  vacancyId: string;
  name: string;
  stage: string;
  score: number;
  lrProba: number;
  rfProba: number;
  catProba: number;
  nerFeatures: Record<string, number>;
  positiveFactors: ExplanationFactor[];
  negativeFactors: ExplanationFactor[];
}

export interface BulkCandidateResult {
  filename: string;
  status: "done" | "error";
  candidate: CandidateScreeningResult | null;
  errorMessage: string | null;
}

export interface CandidateDetail {
  id: string;
  vacancyId: string;
  vacancyTitle: string;
  name: string;
  stage: string;
  score: number;
  lrProba: number;
  rfProba: number;
  catProba: number;
  position: string;
  lastPosition: string;
  seniorityLabel: string;
  educationLabel: string;
  gradYear: number | null;
  totalExperience: number;
  techSkills: string[];
  softSkills: string[];
  positiveFactors: ExplanationFactor[];
  negativeFactors: ExplanationFactor[];
  sourceFilename: string | null;
  createdAt: string;
}