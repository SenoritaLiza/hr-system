from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Candidate, Vacancy
from app.schemas import PipelineCardOut, PipelineStageOut, VacancyCreate, VacancyOut

router = APIRouter(prefix="/vacancies", tags=["vacancies"])

PIPELINE_STAGES = [
    ("applied", "Отклик"),
    ("screening", "Скрининг ИИ"),
    ("interview", "Интервью"),
    ("offer", "Оффер"),
    ("closed", "Нанят / Отказ"),
]

CARDS_PER_STAGE_LIMIT = 5


def _initials(name: str) -> str:
    parts = name.split()
    return "".join(p[0] for p in parts[:2]).upper()


def _to_out(vacancy: Vacancy, db: Session) -> VacancyOut:
    in_pipeline = db.scalar(
        select(func.count()).select_from(Candidate).where(Candidate.vacancy_id == vacancy.id)
    )
    in_interview = db.scalar(
        select(func.count())
        .select_from(Candidate)
        .where(Candidate.vacancy_id == vacancy.id, Candidate.stage == "interview")
    )
    return VacancyOut(
        id=vacancy.id,
        title=vacancy.title,
        department=vacancy.department,
        status=vacancy.status,
        opened_at=vacancy.opened_at,
        owner=vacancy.owner,
        in_pipeline=in_pipeline or 0,
        in_interview=in_interview or None,
    )


def _candidate_to_card(candidate: Candidate) -> PipelineCardOut:
    return PipelineCardOut(
        candidate_id=str(candidate.id),
        name=candidate.name,
        initials=_initials(candidate.name),
        note=candidate.last_position or candidate.position or "—",
        score=round(candidate.score * 100),
    )


def _get_or_404(vacancy_id: int, db: Session) -> Vacancy:
    vacancy = db.get(Vacancy, vacancy_id)
    if vacancy is None:
        raise HTTPException(status_code=404, detail="Вакансия не найдена")
    return vacancy


@router.get("", response_model=list[VacancyOut])
def list_vacancies(db: Session = Depends(get_db)) -> list[VacancyOut]:
    vacancies = db.scalars(select(Vacancy).order_by(Vacancy.created_at.desc())).all()
    return [_to_out(v, db) for v in vacancies]


@router.post("", response_model=VacancyOut, status_code=201)
def create_vacancy(payload: VacancyCreate, db: Session = Depends(get_db)) -> VacancyOut:
    vacancy = Vacancy(**payload.model_dump())
    db.add(vacancy)
    db.commit()
    db.refresh(vacancy)
    return _to_out(vacancy, db)


@router.get("/{vacancy_id}", response_model=VacancyOut)
def get_vacancy(vacancy_id: int, db: Session = Depends(get_db)) -> VacancyOut:
    return _to_out(_get_or_404(vacancy_id, db), db)


@router.get("/{vacancy_id}/pipeline", response_model=list[PipelineStageOut])
def get_pipeline(vacancy_id: int, db: Session = Depends(get_db)) -> list[PipelineStageOut]:
    _get_or_404(vacancy_id, db)

    stages = []
    for stage_id, label in PIPELINE_STAGES:
        candidates = db.scalars(
            select(Candidate)
            .where(Candidate.vacancy_id == vacancy_id, Candidate.stage == stage_id)
            .order_by(Candidate.created_at.desc())
        ).all()
        stages.append(
            PipelineStageOut(
                id=stage_id,
                label=label,
                total=len(candidates),
                cards=[_candidate_to_card(c) for c in candidates[:CARDS_PER_STAGE_LIMIT]],
                more_count=max(0, len(candidates) - CARDS_PER_STAGE_LIMIT),
            )
        )
    return stages