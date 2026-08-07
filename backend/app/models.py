from datetime import date, datetime

from sqlalchemy import JSON, Date, DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Vacancy(Base):
    __tablename__ = "vacancies"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    department: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(20), default="open")
    opened_at: Mapped[date] = mapped_column(Date, server_default=func.current_date())
    owner: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(primary_key=True)
    vacancy_id: Mapped[int] = mapped_column(ForeignKey("vacancies.id"))
    name: Mapped[str] = mapped_column(String(200))
    stage: Mapped[str] = mapped_column(String(20), default="screening")
    position: Mapped[str] = mapped_column(String(200), default="")
    experience_text: Mapped[str] = mapped_column(Text, default="")
    skills: Mapped[str] = mapped_column(Text, default="")
    education: Mapped[str] = mapped_column(Text, default="")
    total_experience: Mapped[float] = mapped_column(Float, default=0)
    last_position: Mapped[str] = mapped_column(String(200), default="")
    source_filename: Mapped[str | None] = mapped_column(String(300), nullable=True)
    score: Mapped[float] = mapped_column(Float)
    lr_proba: Mapped[float] = mapped_column(Float)
    rf_proba: Mapped[float] = mapped_column(Float)
    cat_proba: Mapped[float] = mapped_column(Float)
    ner_features: Mapped[dict] = mapped_column(JSON)
    positive_factors: Mapped[list] = mapped_column(JSON)
    negative_factors: Mapped[list] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())