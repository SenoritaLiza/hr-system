from datetime import date, datetime

from pydantic import BaseModel


class VacancyCreate(BaseModel):
    title: str
    department: str
    owner: str
    status: str = "open"


class VacancyOut(BaseModel):
    id: int
    title: str
    department: str
    status: str
    opened_at: date
    owner: str
    in_pipeline: int
    in_interview: int | None


class PipelineCardOut(BaseModel):
    candidate_id: str
    name: str
    initials: str
    note: str
    score: int | None


class PipelineStageOut(BaseModel):
    id: str
    label: str
    total: int
    cards: list[PipelineCardOut]
    more_count: int


class ExplanationFactorOut(BaseModel):
    label: str
    weight: float


class CandidateCreate(BaseModel):
    name: str
    position: str = ""
    experience_text: str = ""
    skills: str = ""
    education: str = ""
    total_experience: float = 0
    last_position: str = ""


class CandidateOut(BaseModel):
    id: int
    vacancy_id: int
    name: str
    stage: str
    score: int
    lr_proba: float
    rf_proba: float
    cat_proba: float
    ner_features: dict
    positive_factors: list[ExplanationFactorOut]
    negative_factors: list[ExplanationFactorOut]


class BulkCandidateResultOut(BaseModel):
    filename: str
    status: str
    candidate: CandidateOut | None = None
    error_message: str | None = None


class CandidateListItemOut(BaseModel):
    id: int
    vacancy_id: int
    vacancy_title: str
    name: str
    initials: str
    stage: str
    score: int
    position: str
    last_position: str
    total_experience: float
    tech_skills: list[str]
    soft_skills: list[str]
    created_at: datetime


class CandidateDetailOut(BaseModel):
    id: int
    vacancy_id: int
    vacancy_title: str
    name: str
    stage: str
    score: int
    lr_proba: float
    rf_proba: float
    cat_proba: float
    position: str
    last_position: str
    seniority_label: str
    education_label: str
    grad_year: int | None
    total_experience: float
    tech_skills: list[str]
    soft_skills: list[str]
    positive_factors: list[ExplanationFactorOut]
    negative_factors: list[ExplanationFactorOut]
    source_filename: str | None
    created_at: datetime