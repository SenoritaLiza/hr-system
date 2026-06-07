"""NER-модуль: правилоориентированное извлечение именованных сущностей из резюме.

Извлекаемые признаки (entities):
- skills_count       — количество навыков из структурированного столбца
- tech_skills_count  — количество технических ключевых слов в тексте
- soft_skills_count  — количество упоминаний гибких навыков
- typo_density       — доля слов с явными опечатками (3+ одинаковых символа подряд)
- edu_level          — уровень образования (1–4)
- grad_year          — год окончания (0 если не указан)
- seniority          — уровень позиции (1 = Intern … 8 = Director)
- total_experience   — годы опыта (число)
- action_count       — количество профессиональных глаголов/фраз
"""

import re
import pandas as pd

# ── Ключевые слова ──────────────────────────────────────────────────────────

TECH_KEYWORDS = {
    "python", "sql", "java", "javascript", "typescript", "go", "rust", "c++",
    "docker", "kubernetes", "aws", "gcp", "azure", "linux", "bash",
    "react", "vue", "angular", "django", "fastapi", "flask", "spring",
    "pytorch", "tensorflow", "scikit-learn", "xgboost", "lightgbm", "catboost",
    "pandas", "numpy", "matplotlib", "airflow", "mlops", "spark", "kafka",
    "git", "redis", "postgresql", "mongodb", "elasticsearch",
    "ansible", "terraform", "ci/cd", "jenkins", "github actions",
    "jira", "figma", "webpack", "typescript", "redux",
}

SOFT_SKILLS_PHRASES = {
    "communication", "teamwork", "leadership", "adaptive", "motivated",
    "responsible", "detail oriented", "stakeholders", "presentation",
    "research", "quick learner", "worked in a team", "commercial experience",
    "hands-on", "practical experience", "participated in",
}

ACTION_PHRASES = {
    "implemented", "developed", "built", "optimized", "led", "designed",
    "automated", "analysed", "improved", "supported", "delivered",
    "deployed", "architected", "managed", "created", "launched",
}

# Уровни должности (чем выше — тем выше уровень)
SENIORITY_MAP = {
    "intern": 1,
    "junior": 2,
    "specialist": 3,
    "analyst": 3,
    "middle": 4,
    "engineer": 4,
    "senior": 5,
    "lead": 6,
    "principal": 6,
    "head": 7,
    "architect": 7,
    "director": 8,
}

EDU_LEVEL_MAP = {
    "phd": 4, "doctor": 4, "candidate": 4,
    "master": 3, "мастер": 3, "магистр": 3,
    "bachelor": 2, "бакалавр": 2,
    "college": 1, "diploma": 1,
}


# ── Вспомогательные функции ─────────────────────────────────────────────────

def detect_typo_density(text: str) -> float:
    """Доля слов с 3+ повторяющимися символами подряд — маркер небрежности."""
    words = text.lower().split()
    if not words:
        return 0.0
    typo_count = sum(1 for w in words if re.search(r"(.)\1{2,}", w))
    return typo_count / len(words)


def get_seniority(position: str) -> int:
    """Числовой уровень позиции из строки last_position."""
    if not position or pd.isna(position):
        return 2
    pos = str(position).lower()
    best = 2
    for key, val in SENIORITY_MAP.items():
        if key in pos and val > best:
            best = val
    return best


def get_edu_level(education: str) -> int:
    """Уровень образования из строки education."""
    if not education or pd.isna(education):
        return 1
    edu = str(education).lower()
    for key, val in EDU_LEVEL_MAP.items():
        if key in edu:
            return val
    return 1


def get_grad_year(education: str) -> int:
    """Год выпуска из строки education."""
    if not education or pd.isna(education):
        return 0
    match = re.search(r"(\d{4})\s+graduation", str(education).lower())
    return int(match.group(1)) if match else 0


# ── Основная функция ────────────────────────────────────────────────────────

def extract_ner_features(row: dict) -> dict:
    """Извлекает NER-признаки из строки датафрейма (переданной как dict)."""
    text = str(row.get("full_text", "") or "").lower()
    skills_str = str(row.get("skills", "") or "").lower()

    # Количество структурированных навыков
    skill_list = [s.strip() for s in skills_str.split(",") if len(s.strip()) > 2]
    skills_count = len(skill_list)

    # Технические навыки в тексте
    tech_count = sum(1 for kw in TECH_KEYWORDS if kw in text)

    # Мягкие навыки
    soft_count = sum(1 for ph in SOFT_SKILLS_PHRASES if ph in text)

    # Профессиональные глаголы
    action_count = sum(1 for ph in ACTION_PHRASES if ph in text)

    # Плотность опечаток
    typo_density = detect_typo_density(text)

    # Образование
    edu_level = get_edu_level(row.get("education", ""))
    grad_year = get_grad_year(row.get("education", ""))

    # Уровень позиции
    seniority = get_seniority(row.get("last_position", ""))

    # Опыт
    exp = pd.to_numeric(row.get("total_experience", 0), errors="coerce")
    exp = 0.0 if pd.isna(exp) else float(exp)

    return {
        "skills_count": skills_count,
        "tech_skills_count": tech_count,
        "soft_skills_count": soft_count,
        "action_count": action_count,
        "typo_density": typo_density,
        "edu_level": edu_level,
        "grad_year": grad_year,
        "seniority": seniority,
        "total_experience": exp,
    }


NER_FEATURE_NAMES = [
    "skills_count", "tech_skills_count", "soft_skills_count",
    "action_count", "typo_density", "edu_level", "grad_year",
    "seniority", "total_experience",
]

# Русские названия для отображения
NER_FEATURE_NAMES_RU = {
    "skills_count": "Количество навыков",
    "tech_skills_count": "Технических навыков в тексте",
    "soft_skills_count": "Гибких навыков",
    "action_count": "Профессиональных глаголов",
    "typo_density": "Плотность опечаток",
    "edu_level": "Уровень образования",
    "grad_year": "Год выпуска",
    "seniority": "Уровень должности",
    "total_experience": "Лет опыта",
}

SENIORITY_LABELS = {
    1: "Стажёр (Intern)",
    2: "Младший (Junior)",
    3: "Специалист/Аналитик",
    4: "Инженер (Middle)",
    5: "Старший (Senior)",
    6: "Ведущий (Lead)",
    7: "Руководитель (Head/Architect)",
    8: "Директор",
}

EDU_LABELS = {
    1: "Среднее / не указано",
    2: "Бакалавр",
    3: "Магистр",
    4: "PhD / Кандидат наук",
}
