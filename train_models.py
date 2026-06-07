"""Скрипт обучения моделей HR-системы.

Этапы:
1. Загрузка и предобработка данных
2. Baseline: TF-IDF + LogReg / RF / CatBoost
3. Извлечение NER-признаков
4. Гибридный классификатор: TF-IDF + NER
5. Сравнение baseline vs гибридный
6. Сохранение моделей в папку models/

Запуск:
    python train_models.py [--data data.csv]
"""

import os
import re
import warnings
import argparse
import json

warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, roc_curve, confusion_matrix,
)
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import StandardScaler
from scipy.sparse import hstack, csr_matrix
import joblib

from catboost import CatBoostClassifier

from preprocessing import preprocess_text, build_full_text
from ner_module import extract_ner_features, NER_FEATURE_NAMES

RANDOM_STATE = 42
MAX_FEATURES = 5000
TEST_SIZE = 0.2
MODELS_DIR = "models"


# ────────────────────────────────────────────────────────────────────────────
# 1. Загрузка данных
# ────────────────────────────────────────────────────────────────────────────

def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.columns = [c.strip().lower() for c in df.columns]
    required = ["experience_text", "skills", "education", "target"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Отсутствуют столбцы: {missing}")
    print(f"Загружено {len(df)} строк, столбцы: {list(df.columns)}")
    return df


# ────────────────────────────────────────────────────────────────────────────
# 2. Предобработка текста
# ────────────────────────────────────────────────────────────────────────────

def prepare_texts(df: pd.DataFrame) -> pd.DataFrame:
    print("Объединяем текстовые столбцы…")
    df["full_text"] = df.apply(lambda r: build_full_text(r), axis=1)
    print("Лемматизируем тексты… (может занять пару минут)")
    df["clean_text"] = df["full_text"].apply(preprocess_text)
    df = df[df["clean_text"].str.len() >= 10].copy()
    print(f"После фильтрации: {len(df)} строк")
    return df


# ────────────────────────────────────────────────────────────────────────────
# 3. Метрики
# ────────────────────────────────────────────────────────────────────────────

def evaluate(name, y_true, y_pred, y_proba) -> dict:
    return {
        "model": name,
        "accuracy":  round(accuracy_score(y_true, y_pred), 4),
        "precision": round(precision_score(y_true, y_pred, zero_division=0), 4),
        "recall":    round(recall_score(y_true, y_pred, zero_division=0), 4),
        "f1":        round(f1_score(y_true, y_pred, zero_division=0), 4),
        "roc_auc":   round(roc_auc_score(y_true, y_proba), 4),
    }


# ────────────────────────────────────────────────────────────────────────────
# 4. Обучение baseline
# ────────────────────────────────────────────────────────────────────────────

def train_baseline(X_train, X_test, y_train, y_test):
    print("\n── Baseline: TF-IDF ──")
    tfidf = TfidfVectorizer(max_features=MAX_FEATURES, sublinear_tf=True, ngram_range=(1, 2))
    Xtr = tfidf.fit_transform(X_train)
    Xte = tfidf.transform(X_test)

    lr = LogisticRegression(C=1.0, max_iter=1000, random_state=RANDOM_STATE)
    lr.fit(Xtr, y_train)

    rf = RandomForestClassifier(n_estimators=150, max_depth=20,
                                random_state=RANDOM_STATE, n_jobs=-1)
    rf.fit(Xtr, y_train)

    n_comp = min(100, Xtr.shape[1] - 1)
    svd = TruncatedSVD(n_components=n_comp, random_state=RANDOM_STATE)
    Xtr_svd = svd.fit_transform(Xtr)
    Xte_svd = svd.transform(Xte)

    cat = CatBoostClassifier(iterations=500, learning_rate=0.05, depth=6,
                              loss_function="Logloss", verbose=0,
                              random_state=RANDOM_STATE, allow_writing_files=False)
    cat.fit(Xtr_svd, y_train, eval_set=(Xte_svd, y_test), use_best_model=True)

    results = []
    for name, model, Xte_m in [
        ("Baseline LR", lr, Xte),
        ("Baseline RF", rf, Xte),
        ("Baseline CatBoost", cat, Xte_svd),
    ]:
        pred = model.predict(Xte_m)
        if hasattr(pred, "astype"):
            pred = pred.astype(int)
        proba = model.predict_proba(Xte_m)[:, 1]
        results.append(evaluate(name, y_test, pred, proba))
        print(f"  {name}: F1={results[-1]['f1']:.4f}  ROC-AUC={results[-1]['roc_auc']:.4f}")

    return tfidf, lr, rf, svd, cat, results, Xtr, Xte, Xtr_svd, Xte_svd


# ────────────────────────────────────────────────────────────────────────────
# 5. Извлечение NER-признаков
# ────────────────────────────────────────────────────────────────────────────

def build_ner_matrix(df: pd.DataFrame, index) -> np.ndarray:
    rows = [extract_ner_features(r) for _, r in df.loc[index].iterrows()]
    return pd.DataFrame(rows, columns=NER_FEATURE_NAMES).values.astype(float)


# ────────────────────────────────────────────────────────────────────────────
# 6. Обучение гибридного классификатора
# ────────────────────────────────────────────────────────────────────────────

def train_hybrid(Xtr_tfidf, Xte_tfidf, ner_tr, ner_te, y_train, y_test):
    print("\n── Гибридный классификатор: TF-IDF + NER ──")
    scaler = StandardScaler()
    ner_tr_s = scaler.fit_transform(ner_tr)
    ner_te_s = scaler.transform(ner_te)

    Xtr_h = hstack([Xtr_tfidf, csr_matrix(ner_tr_s)])
    Xte_h = hstack([Xte_tfidf, csr_matrix(ner_te_s)])

    lr_h = LogisticRegression(C=1.0, max_iter=1000, random_state=RANDOM_STATE)
    lr_h.fit(Xtr_h, y_train)

    rf_h = RandomForestClassifier(n_estimators=150, max_depth=20,
                                   random_state=RANDOM_STATE, n_jobs=-1)
    rf_h.fit(Xtr_h, y_train)

    n_comp = min(100, Xtr_h.shape[1] - 1)
    svd_h = TruncatedSVD(n_components=n_comp, random_state=RANDOM_STATE)
    Xtr_svd_h = svd_h.fit_transform(Xtr_h)
    Xte_svd_h = svd_h.transform(Xte_h)

    cat_h = CatBoostClassifier(iterations=500, learning_rate=0.05, depth=6,
                                loss_function="Logloss", verbose=0,
                                random_state=RANDOM_STATE, allow_writing_files=False)
    cat_h.fit(Xtr_svd_h, y_train, eval_set=(Xte_svd_h, y_test), use_best_model=True)

    results = []
    for name, model, Xte_m in [
        ("Hybrid LR", lr_h, Xte_h),
        ("Hybrid RF", rf_h, Xte_h),
        ("Hybrid CatBoost", cat_h, Xte_svd_h),
    ]:
        pred = model.predict(Xte_m)
        if hasattr(pred, "astype"):
            pred = pred.astype(int)
        proba = model.predict_proba(Xte_m)[:, 1]
        results.append(evaluate(name, y_test, pred, proba))
        print(f"  {name}: F1={results[-1]['f1']:.4f}  ROC-AUC={results[-1]['roc_auc']:.4f}")

    return lr_h, rf_h, svd_h, cat_h, scaler, results, Xte_h, Xte_svd_h


# ────────────────────────────────────────────────────────────────────────────
# 7. Визуализация и сохранение
# ────────────────────────────────────────────────────────────────────────────

def plot_roc_comparison(y_test, models_probas: dict, save_path: str):
    plt.figure(figsize=(9, 7))
    for name, proba in models_probas.items():
        fpr, tpr, _ = roc_curve(y_test, proba)
        auc = roc_auc_score(y_test, proba)
        ls = "--" if "Baseline" in name else "-"
        plt.plot(fpr, tpr, linestyle=ls, label=f"{name} (AUC={auc:.3f})")
    plt.plot([0, 1], [0, 1], "k:", label="Случайная модель")
    plt.title("ROC-кривые: Baseline vs Гибридный", fontsize=14)
    plt.xlabel("FPR")
    plt.ylabel("TPR")
    plt.legend(fontsize=9)
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(save_path, dpi=120)
    plt.close()
    print(f"  ROC-кривые сохранены → {save_path}")


def plot_metrics_bar(results: list, save_path: str):
    df_r = pd.DataFrame(results).set_index("model")
    ax = df_r[["accuracy", "precision", "recall", "f1", "roc_auc"]].plot(
        kind="bar", figsize=(12, 6), rot=30
    )
    ax.set_title("Сравнение метрик: Baseline vs Гибридный", fontsize=14)
    ax.set_ylim(0, 1.05)
    ax.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(save_path, dpi=120)
    plt.close()
    print(f"  График метрик сохранён → {save_path}")


def save_models(models_dir, tfidf, lr, rf, svd_base, cat_base,
                lr_h, rf_h, svd_h, cat_h, scaler):
    os.makedirs(models_dir, exist_ok=True)
    artifacts = {
        "tfidf": tfidf,
        "baseline_lr": lr,
        "baseline_rf": rf,
        "baseline_svd": svd_base,
        "baseline_cat": cat_base,
        "hybrid_lr": lr_h,
        "hybrid_rf": rf_h,
        "hybrid_svd": svd_h,
        "hybrid_cat": cat_h,
        "ner_scaler": scaler,
    }
    for name, obj in artifacts.items():
        path = os.path.join(models_dir, f"{name}.joblib")
        joblib.dump(obj, path)
    print(f"\nМодели сохранены в папку '{models_dir}/'")


# ────────────────────────────────────────────────────────────────────────────
# main
# ────────────────────────────────────────────────────────────────────────────

def main(data_path: str):
    # 1. Загрузка
    df = load_data(data_path)

    # 2. Предобработка
    df = prepare_texts(df)

    X = df["clean_text"]
    y = df["target"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    print(f"Train: {len(X_train)}  Test: {len(X_test)}")

    # 3. Baseline
    tfidf, lr, rf, svd_base, cat_base, base_results, \
        Xtr_tfidf, Xte_tfidf, Xtr_svd, Xte_svd = train_baseline(
            X_train, X_test, y_train, y_test
        )

    # 4. NER-признаки
    print("\n── Извлечение NER-признаков ──")
    ner_tr = build_ner_matrix(df, X_train.index)
    ner_te = build_ner_matrix(df, X_test.index)
    print(f"  NER матрица train: {ner_tr.shape}  test: {ner_te.shape}")

    # 5. Гибридный
    lr_h, rf_h, svd_h, cat_h, scaler, hybrid_results, \
        Xte_hybrid, Xte_svd_h = train_hybrid(
            Xtr_tfidf, Xte_tfidf, ner_tr, ner_te, y_train, y_test
        )

    # 6. Сравнительная таблица
    all_results = base_results + hybrid_results
    df_metrics = pd.DataFrame(all_results).sort_values("roc_auc", ascending=False)
    print("\n── Итоговая таблица метрик ──")
    print(df_metrics.to_string(index=False))
    df_metrics.to_csv("metrics_comparison.csv", index=False)

    # 7. Графики
    os.makedirs(MODELS_DIR, exist_ok=True)
    probas = {}
    for res, model, Xte_m in [
        (base_results[0], lr, Xte_tfidf),
        (base_results[2], cat_base, Xte_svd),
        (hybrid_results[0], lr_h, Xte_hybrid),
        (hybrid_results[2], cat_h, Xte_svd_h),
    ]:
        pred = model.predict(Xte_m)
        probas[res["model"]] = model.predict_proba(Xte_m)[:, 1]

    plot_roc_comparison(y_test, probas, os.path.join(MODELS_DIR, "roc_comparison.png"))
    plot_metrics_bar(all_results, os.path.join(MODELS_DIR, "metrics_bar.png"))

    # 8. Сохранение
    save_models(MODELS_DIR, tfidf, lr, rf, svd_base, cat_base,
                lr_h, rf_h, svd_h, cat_h, scaler)

    print("\n✅ Обучение завершено.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train HR classification models")
    parser.add_argument("--data", default="data.csv", help="Путь к CSV-файлу")
    args = parser.parse_args()
    main(args.data)
