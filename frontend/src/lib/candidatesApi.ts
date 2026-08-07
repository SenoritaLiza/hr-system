import { apiFetch } from "@/lib/api";
import type { BulkCandidateResult, CandidateScreeningResult, ExplanationFactor } from "@/types/screening";

interface ApiCandidateOut {
  id: number;
  vacancy_id: number;
  name: string;
  stage: string;
  score: number;
  lr_proba: number;
  rf_proba: number;
  cat_proba: number;
  ner_features: Record<string, number>;
  positive_factors: ExplanationFactor[];
  negative_factors: ExplanationFactor[];
}

interface ApiBulkCandidateResult {
  filename: string;
  status: string;
  candidate: ApiCandidateOut | null;
  error_message: string | null;
}

function mapCandidate(c: ApiCandidateOut): CandidateScreeningResult {
  return {
    id: String(c.id),
    vacancyId: String(c.vacancy_id),
    name: c.name,
    stage: c.stage,
    score: c.score,
    lrProba: c.lr_proba,
    rfProba: c.rf_proba,
    catProba: c.cat_proba,
    nerFeatures: c.ner_features,
    positiveFactors: c.positive_factors,
    negativeFactors: c.negative_factors,
  };
}

export interface CreateCandidateInput {
  name: string;
  position?: string;
  experienceText?: string;
  skills?: string;
  education?: string;
  totalExperience?: number;
  lastPosition?: string;
  file?: File;
}

export function createCandidate(vacancyId: string, input: CreateCandidateInput): Promise<CandidateScreeningResult> {
  const form = new FormData();
  form.set("name", input.name);
  if (input.position) form.set("position", input.position);
  if (input.experienceText) form.set("experience_text", input.experienceText);
  if (input.skills) form.set("skills", input.skills);
  if (input.education) form.set("education", input.education);
  if (input.totalExperience !== undefined) form.set("total_experience", String(input.totalExperience));
  if (input.lastPosition) form.set("last_position", input.lastPosition);
  if (input.file) form.set("file", input.file);

  return apiFetch<ApiCandidateOut>(`/vacancies/${vacancyId}/candidates`, {
    method: "POST",
    body: form,
  }).then(mapCandidate);
}

export function createCandidatesBulk(vacancyId: string, files: File[]): Promise<BulkCandidateResult[]> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));

  return apiFetch<ApiBulkCandidateResult[]>(`/vacancies/${vacancyId}/candidates/bulk`, {
    method: "POST",
    body: form,
  }).then((results) =>
    results.map((r) => ({
      filename: r.filename,
      status: r.status as BulkCandidateResult["status"],
      candidate: r.candidate ? mapCandidate(r.candidate) : null,
      errorMessage: r.error_message,
    })),
  );
}
