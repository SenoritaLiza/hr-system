import { apiFetch } from "@/lib/api";
import type { PipelineCard, PipelineStage, PipelineStageId, Vacancy, VacancyStatus } from "@/types/vacancy";

interface ApiVacancy {
  id: number;
  title: string;
  department: string;
  status: VacancyStatus;
  opened_at: string;
  owner: string;
  in_pipeline: number;
  in_interview: number | null;
}

interface ApiPipelineCard {
  candidate_id: string;
  name: string;
  initials: string;
  note: string;
  score: number | null;
  status: PipelineCard["status"];
  status_label: string;
}

interface ApiPipelineStage {
  id: string;
  label: string;
  total: number;
  cards: ApiPipelineCard[];
  more_count: number;
}

const STATUS_LABEL: Record<VacancyStatus, string> = {
  open: "Открыта",
  paused: "На паузе",
  closed: "Закрыта",
};

const STATUS_VERB: Record<VacancyStatus, string> = {
  open: "открыта",
  paused: "на паузе с",
  closed: "закрыта",
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function mapVacancy(v: ApiVacancy): Vacancy {
  return {
    id: String(v.id),
    title: v.title,
    department: v.department,
    status: v.status,
    statusLabel: STATUS_LABEL[v.status],
    openedLabel: `${STATUS_VERB[v.status]} ${formatDate(v.opened_at)}`,
    owner: v.owner,
    inPipeline: v.in_pipeline,
    inInterview: v.in_interview,
  };
}

function mapPipelineStage(s: ApiPipelineStage): PipelineStage {
  return {
    id: s.id as PipelineStageId,
    label: s.label,
    total: s.total,
    moreCount: s.more_count,
    cards: s.cards.map((c) => ({
      candidateId: c.candidate_id,
      name: c.name,
      initials: c.initials,
      note: c.note,
      score: c.score,
      status: c.status,
      statusLabel: c.status_label,
    })),
  };
}

export function fetchVacancies(): Promise<Vacancy[]> {
  return apiFetch<ApiVacancy[]>("/vacancies").then((data) => data.map(mapVacancy));
}

export function fetchVacancy(id: string): Promise<Vacancy> {
  return apiFetch<ApiVacancy>(`/vacancies/${id}`).then(mapVacancy);
}

export function fetchPipeline(id: string): Promise<PipelineStage[]> {
  return apiFetch<ApiPipelineStage[]>(`/vacancies/${id}/pipeline`).then((data) => data.map(mapPipelineStage));
}

export interface CreateVacancyInput {
  title: string;
  department: string;
  owner: string;
}

export function createVacancy(input: CreateVacancyInput): Promise<Vacancy> {
  return apiFetch<ApiVacancy>("/vacancies", {
    method: "POST",
    body: JSON.stringify(input),
  }).then(mapVacancy);
}
