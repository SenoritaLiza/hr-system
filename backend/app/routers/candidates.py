from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.db import get_db
from app.ml.scoring import score_resume
from app.ml.text_extract import UnsupportedFileFormat, extract_text
from app.models import Candidate, Vacancy
from app.schemas import BulkCandidateResultOut, CandidateOut

router = APIRouter(prefix="/vacancies/{vacancy_id}/candidates", tags=["candidates"])


def _get_vacancy_or_404(vacancy_id: int, db: Session) -> Vacancy:
    vacancy = db.get(Vacancy, vacancy_id)
    if vacancy is None:
        raise HTTPException(status_code=404, detail="Вакансия не найдена")
    return vacancy


def _display_name_from_filename(filename: str) -> str:
    stem = filename.rsplit(".", 1)[0]
    return stem.replace("_", " ").replace("-", " ").strip()


def _score_and_save(db: Session, vacancy_id: int, name: str, row: dict, source_filename: str | None) -> Candidate:
    result = score_resume(row)
    candidate = Candidate(
        vacancy_id=vacancy_id,
        name=name,
        position=row.get("position", ""),
        experience_text=row.get("experience_text", ""),
        skills=row.get("skills", ""),
        education=row.get("education", ""),
        total_experience=row.get("total_experience", 0),
        last_position=row.get("last_position", ""),
        source_filename=source_filename,
        score=result["avg_proba"],
        lr_proba=result["lr_proba"],
        rf_proba=result["rf_proba"],
        cat_proba=result["cat_proba"],
        ner_features=result["ner_features"],
        positive_factors=result["positive_factors"],
        negative_factors=result["negative_factors"],
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


def _to_out(candidate: Candidate) -> CandidateOut:
    return CandidateOut(
        id=candidate.id,
        vacancy_id=candidate.vacancy_id,
        name=candidate.name,
        stage=candidate.stage,
        score=round(candidate.score * 100),
        lr_proba=candidate.lr_proba,
        rf_proba=candidate.rf_proba,
        cat_proba=candidate.cat_proba,
        ner_features=candidate.ner_features,
        positive_factors=candidate.positive_factors,
        negative_factors=candidate.negative_factors,
    )


@router.post("", response_model=CandidateOut, status_code=201)
async def create_candidate(
    vacancy_id: int,
    name: str = Form(...),
    position: str = Form(""),
    experience_text: str = Form(""),
    skills: str = Form(""),
    education: str = Form(""),
    total_experience: float = Form(0),
    last_position: str = Form(""),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
) -> CandidateOut:
    _get_vacancy_or_404(vacancy_id, db)

    source_filename = None
    if file is not None:
        content = await file.read()
        try:
            extracted = extract_text(file.filename or "", content)
        except UnsupportedFileFormat as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        experience_text, education, skills = extracted, extracted, ""
        source_filename = file.filename

    if not experience_text.strip() and not skills.strip():
        raise HTTPException(status_code=422, detail="Заполните хотя бы поле «Описание опыта» или «Навыки»")

    row = {
        "position": position,
        "experience_text": experience_text,
        "skills": skills,
        "education": education,
        "total_experience": total_experience,
        "last_position": last_position,
    }
    candidate = _score_and_save(db, vacancy_id, name, row, source_filename)
    return _to_out(candidate)


@router.post("/bulk", response_model=list[BulkCandidateResultOut])
async def create_candidates_bulk(
    vacancy_id: int,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
) -> list[BulkCandidateResultOut]:
    _get_vacancy_or_404(vacancy_id, db)

    results: list[BulkCandidateResultOut] = []
    for f in files:
        filename = f.filename or "resume"
        content = await f.read()
        try:
            extracted = extract_text(filename, content)
        except UnsupportedFileFormat as exc:
            results.append(BulkCandidateResultOut(filename=filename, status="error", error_message=str(exc)))
            continue

        row = {
            "position": "",
            "experience_text": extracted,
            "skills": "",
            "education": extracted,
            "total_experience": 0,
            "last_position": "",
        }
        candidate = _score_and_save(db, vacancy_id, _display_name_from_filename(filename), row, filename)
        results.append(BulkCandidateResultOut(filename=filename, status="done", candidate=_to_out(candidate)))

    return results