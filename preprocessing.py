import platform
import re
import nltk

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

try:
    if platform.machine() not in ("x86_64", "AMD64"):
        # Бинарник Yandex Mystem собирается только под x86_64: на arm64 вызов не падает
        # с исключением, а зависает (сломанный subprocess), поэтому проверяем архитектуру
        # заранее и не пытаемся его запускать вовсе.
        raise RuntimeError("mystem недоступен на этой архитектуре")
    from pymystem3 import Mystem
    _mystem = Mystem()
    _USE_MYSTEM = True
except Exception:
    _mystem = None
    _USE_MYSTEM = False


# Очистка и лемматизация текста резюме
def preprocess_text(text: str) -> str:
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


# Объединение текстовых столбцов резюме в одну строку
def build_full_text(row) -> str:
    parts = [
        str(row.get("experience_text", "") or ""),
        str(row.get("skills", "") or ""),
        str(row.get("education", "") or ""),
    ]
    return " ".join(parts)