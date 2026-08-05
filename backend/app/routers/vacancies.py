from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Vacancy
from app.schemas import PipelineStageOut, VacancyCreate, VacancyOut

router = APIRouter(prefix="/vacancies", tags=["vacancies"])

PIPELINE_STAGES = [
    ("applied", "Отклик"),
    ("screening", "Скрининг ИИ"),
    ("interview", "Интервью"),
    ("offer", "Оффер"),
    ("closed", "Нанят / Отказ"),
]


def _to_out(vacancy: Vacancy) -> VacancyOut:
    return VacancyOut(
        id=vacancy.id,
        title=vacancy.title,
        department=vacancy.department,
        status=vacancy.status,
        opened_at=vacancy.opened_at,
        owner=vacancy.owner,
        in_pipeline=0,
        in_interview=None,
    )


def _get_or_404(vacancy_id: int, db: Session) -> Vacancy:
    vacancy = db.get(Vacancy, vacancy_id)
    if vacancy is None:
        raise HTTPException(status_code=404, detail="Вакансия не найдена")
    return vacancy


@router.get("", response_model=list[VacancyOut])
def list_vacancies(db: Session = Depends(get_db)) -> list[VacancyOut]:
    vacancies = db.scalars(select(Vacancy).order_by(Vacancy.created_at.desc())).all()
    return [_to_out(v) for v in vacancies]


@router.post("", response_model=VacancyOut, status_code=201)
def create_vacancy(payload: VacancyCreate, db: Session = Depends(get_db)) -> VacancyOut:
    vacancy = Vacancy(**payload.model_dump())
    db.add(vacancy)
    db.commit()
    db.refresh(vacancy)
    return _to_out(vacancy)


@router.get("/{vacancy_id}", response_model=VacancyOut)
def get_vacancy(vacancy_id: int, db: Session = Depends(get_db)) -> VacancyOut:
    return _to_out(_get_or_404(vacancy_id, db))


@router.get("/{vacancy_id}/pipeline", response_model=list[PipelineStageOut])
def get_pipeline(vacancy_id: int, db: Session = Depends(get_db)) -> list[PipelineStageOut]:
    _get_or_404(vacancy_id, db)
    return [
        PipelineStageOut(id=stage_id, label=label, total=0, cards=[], more_count=0)
        for stage_id, label in PIPELINE_STAGES
    ]
