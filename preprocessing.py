"""Общий модуль предобработки текста для HR-системы.

Используется и в скрипте обучения (train_models.py) и в Streamlit-приложении (app.py).
"""

import re
import nltk

# Загрузка ресурсов NLTK при импорте
for resource in ["punkt", "punkt_tab", "stopwords"]:
    try:
        nltk.download(resource, quiet=True)
    except Exception:
        pass

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

RU_STOPWORDS = set(stopwords.words("russian")) | {
    "кандидат", "резюме", "работа", "должность", "вакансия",
    "компания", "человек", "год", "месяц", "также", "очень",
    "опыт", "навык", "навыки", "умение", "умею", "работал",
    "работала", "работать", "проект", "проекты",
}

# Попытка подключить mystem; fallback — без лемматизации
try:
    from pymystem3 import Mystem
    _mystem = Mystem()
    _USE_MYSTEM = True
except Exception:
    _mystem = None
    _USE_MYSTEM = False


def preprocess_text(text: str) -> str:
    """Очистка и лемматизация текста резюме."""
    text = str(text).lower()
    text = re.sub(r"[^a-zа-яё\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    try:
        tokens = word_tokenize(text, language="russian")
    except Exception:
        tokens = text.split()

    filtered = []
    for token in tokens:
        if len(token) < 3:
            continue
        if token in RU_STOPWORDS:
            continue
        if _USE_MYSTEM and _mystem is not None:
            try:
                lemma = _mystem.lemmatize(token)[0].strip()
            except Exception:
                lemma = token
        else:
            lemma = token
        if len(lemma) < 3 or lemma in RU_STOPWORDS:
            continue
        filtered.append(lemma)

    return " ".join(filtered)


def build_full_text(row) -> str:
    """Объединяет текстовые столбцы резюме в одну строку."""
    parts = [
        str(row.get("experience_text", "") or ""),
        str(row.get("skills", "") or ""),
        str(row.get("education", "") or ""),
    ]
    return " ".join(parts)
