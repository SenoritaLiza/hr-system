from datetime import date

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
    status: str
    status_label: str


class PipelineStageOut(BaseModel):
    id: str
    label: str
    total: int
    cards: list[PipelineCardOut]
    more_count: int
