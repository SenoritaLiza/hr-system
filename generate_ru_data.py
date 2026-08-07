"""Генератор синтетического русскоязычного датасета резюме.

Строится по той же логике, что и оригинальный data.csv (English): шаблонные
фразы + намеренные опечатки (тестируют NER-признак typo_density) + связь
target с total_experience. Технические навыки оставлены латиницей — так их
реально пишут в русскоязычных резюме, и это то, что уже умеет ловить
TECH_KEYWORDS в ner_module.py.

Запуск:
    python generate_ru_data.py [--rows 12500] [--out data_ru.csv]
"""

import argparse
import random

import pandas as pd

RANDOM_STATE = 42

POSITIONS = {
    "Backend-разработчик": ["python", "java", "postgresql", "docker", "kubernetes", "redis", "git", "rest", "fastapi", "django"],
    "Python-разработчик": ["python", "django", "fastapi", "flask", "postgresql", "docker", "git", "redis", "pytest"],
    "Аналитик данных": ["sql", "python", "pandas", "excel", "tableau", "power bi", "статистика", "dashboard", "ab testing"],
    "DevOps-инженер": ["docker", "kubernetes", "terraform", "ansible", "ci/cd", "jenkins", "linux", "aws", "bash"],
    "ML-инженер": ["python", "pytorch", "tensorflow", "scikit-learn", "sql", "mlops", "airflow", "pandas", "numpy"],
    "Инженер по тестированию": ["selenium", "pytest", "jira", "postman", "api testing", "bug tracking", "oop", "qa"],
    "Дата-сайентист": ["python", "scikit-learn", "xgboost", "pandas", "numpy", "matplotlib", "sql", "ml"],
    "Продакт-менеджер": ["jira", "confluence", "a/b тестирование", "sql", "аналитика", "roadmap", "стейкхолдеры"],
    "Frontend-разработчик": ["react", "typescript", "javascript", "redux", "webpack", "css", "git", "figma"],
    "Бизнес-аналитик": ["sql", "excel", "bpmn", "confluence", "jira", "аналитика требований", "презентация"],
}

SPECIALTIES = [
    "прикладная математика", "информационные системы", "программная инженерия",
    "компьютерные науки", "бизнес-информатика", "математика и физика",
]

OPENERS = [
    "коммерческий опыт работы с {a} и {b}.",
    "практический опыт работы с {a} и {b}.",
    "готов быстро обучаться новому; работал с {a} и {b}.",
    "ответственный и внимателен к деталям; улучшал процессы с {a}.",
    "имею опыт работы в команде; занимался {a} и {b}.",
]

ACTIONS = ["внедрил", "разработал", "оптимизировал", "поддерживал", "автоматизировал", "запустил", "проанализировал"]
OBJECTS = ["тесты", "сервисы", "процессы", "отчёты", "пайплайны", "интеграции"]

GENERIC_LAST_POSITIONS = ["Стажёр", "Специалист", "Аналитик", "Инженер"]

random.seed(RANDOM_STATE)


def inject_typo(word: str) -> str:
    """Утраивает случайную букву — тот же паттерн опечаток, что и в оригинальном data.csv."""
    if len(word) < 3:
        return word
    i = random.randint(0, len(word) - 1)
    return word[:i] + word[i] * 3 + word[i + 1 :]


def maybe_typo(text: str, prob: float) -> str:
    if random.random() > prob:
        return text
    words = text.split()
    if not words:
        return text
    i = random.randint(0, len(words) - 1)
    words[i] = inject_typo(words[i])
    return " ".join(words)


def make_row() -> dict:
    position = random.choice(list(POSITIONS.keys()))
    pool = POSITIONS[position]
    skill_sample = random.sample(pool, k=min(len(pool), random.randint(4, 8)))

    a, b = random.sample(pool, 2)
    opener = random.choice(OPENERS).format(a=a, b=b)
    action = random.choice(ACTIONS)
    obj = random.choice(OBJECTS)

    total_experience = random.choices(
        population=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        weights=[8, 10, 10, 10, 9, 8, 7, 7, 6, 6, 5, 5, 4],
    )[0]

    experience_text = f"{opener} {total_experience} лет опыта в роли {position.lower()}, {action} {obj}."
    experience_text = maybe_typo(experience_text, prob=0.12)

    edu_level = random.choices(["бакалавр", "магистр"], weights=[0.49, 0.51])[0]
    edu_level = maybe_typo(edu_level, prob=0.1)
    specialty = random.choice(SPECIALTIES)
    grad_year = random.randint(2008, 2023)
    education = f"{edu_level} {specialty}; {grad_year} graduation"

    if random.random() < 0.35:
        last_position = random.choice(GENERIC_LAST_POSITIONS)
    elif total_experience <= 1:
        last_position = f"Junior {position}"
    else:
        last_position = position

    # target коррелирует с опытом — так же, как в оригинальном датасете
    target = 1 if random.random() < (0.75 if total_experience >= 6 else 0.15) else 0

    return {
        "position": position,
        "experience_text": experience_text,
        "skills": ", ".join(skill_sample),
        "education": education,
        "total_experience": total_experience,
        "last_position": last_position,
        "target": target,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=12500)
    parser.add_argument("--out", default="data_ru.csv")
    args = parser.parse_args()

    rows = [make_row() for _ in range(args.rows)]
    df = pd.DataFrame(rows)
    df.to_csv(args.out, index=False)
    print(f"Сохранено {len(df)} строк → {args.out}")
    print(df["target"].value_counts())


if __name__ == "__main__":
    main()
