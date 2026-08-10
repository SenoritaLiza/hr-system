import { apiFetch } from "@/lib/api";
import type {
  BulkCandidateResult,
  CandidateDetail,
  CandidateListItem,
  CandidateScreeningResult,
  ExplanationFactor,
} from "@/types/screening";

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

interface ApiCandidateDetail {
  id: number;
  vacancy_id: number;
  vacancy_title: string;
  name: string;
  stage: string;
  score: number;
  lr_proba: number;
  rf_proba: number;
  cat_proba: number;
  position: string;
  last_position: string;
  seniority_label: string;
  education_label: string;
  grad_year: number | null;
  total_experience: number;
  tech_skills: string[];
  soft_skills: string[];
  positive_factors: ExplanationFactor[];
  negative_factors: ExplanationFactor[];
  source_filename: string | null;
  favorite: boolean;
  created_at: string;
}

interface ApiCandidateListItem {
  id: number;
  vacancy_id: number;
  vacancy_title: string;
  name: string;
  initials: string;
  stage: string;
  score: number;
  position: string;
  last_position: string;
  total_experience: number;
  tech_skills: string[];
  soft_skills: string[];
  favorite: boolean;
  created_at: string;
}

function mapCandidateDetail(c: ApiCandidateDetail): CandidateDetail {
  return {
    id: String(c.id),
    vacancyId: String(c.vacancy_id),
    vacancyTitle: c.vacancy_title,
    name: c.name,
    stage: c.stage,
    score: c.score,
    lrProba: c.lr_proba,
    rfProba: c.rf_proba,
    catProba: c.cat_proba,
    position: c.position,
    lastPosition: c.last_position,
    seniorityLabel: c.seniority_label,
    educationLabel: c.education_label,
    gradYear: c.grad_year,
    totalExperience: c.total_experience,
    techSkills: c.tech_skills,
    softSkills: c.soft_skills,
    positiveFactors: c.positive_factors,
    negativeFactors: c.negative_factors,
    sourceFilename: c.source_filename,
    favorite: c.favorite,
    createdAt: c.created_at,
  };
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

export function fetchCandidate(id: string): Promise<CandidateDetail> {
  return apiFetch<ApiCandidateDetail>(`/candidates/${id}`).then(mapCandidateDetail);
}

export function toggleFavorite(id: string): Promise<CandidateDetail> {
  return apiFetch<ApiCandidateDetail>(`/candidates/${id}/favorite/toggle`, { method: "POST" }).then(
    mapCandidateDetail,
  );
}

export function fetchCandidates(vacancyId?: string): Promise<CandidateListItem[]> {
  const query = vacancyId ? `?vacancy_id=${vacancyId}` : "";
  return apiFetch<ApiCandidateListItem[]>(`/candidates${query}`).then((list) =>
    list.map((c) => ({
      id: String(c.id),
      vacancyId: String(c.vacancy_id),
      vacancyTitle: c.vacancy_title,
      name: c.name,
      initials: c.initials,
      stage: c.stage,
      score: c.score,
      position: c.position,
      lastPosition: c.last_position,
      totalExperience: c.total_experience,
      techSkills: c.tech_skills,
      softSkills: c.soft_skills,
      favorite: c.favorite,
      createdAt: c.created_at,
    })),
  );
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