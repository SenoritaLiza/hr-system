import os

import joblib
import numpy as np
from scipy.sparse import csr_matrix, hstack

from app.config import settings
from ner_module import NER_FEATURE_NAMES, NER_FEATURE_NAMES_RU, extract_ner_features
from preprocessing import build_full_text, preprocess_text

_MODEL_NAMES = ["tfidf", "hybrid_lr", "hybrid_rf", "hybrid_svd", "hybrid_cat", "ner_scaler"]
_models: dict | None = None


def _load_models() -> dict:
    global _models
    if _models is None:
        _models = {
            name: joblib.load(os.path.join(settings.models_dir, f"{name}.joblib"))
            for name in _MODEL_NAMES
        }
    return _models


# Прогоняет резюме через гибридную модель (TF-IDF + NER)
def score_resume(row: dict) -> dict:
    models = _load_models()

    row = {**row, "full_text": build_full_text(row)}
    clean_text = preprocess_text(row["full_text"])

    tfidf_vec = models["tfidf"].transform([clean_text])

    ner_features = extract_ner_features(row)
    ner_arr = np.array([[ner_features[k] for k in NER_FEATURE_NAMES]], dtype=float)
    ner_scaled = models["ner_scaler"].transform(ner_arr)

    x_hybrid = hstack([tfidf_vec, csr_matrix(ner_scaled)])

    lr_proba = float(models["hybrid_lr"].predict_proba(x_hybrid)[0, 1])
    rf_proba = float(models["hybrid_rf"].predict_proba(x_hybrid)[0, 1])
    x_svd = models["hybrid_svd"].transform(x_hybrid)
    cat_proba = float(models["hybrid_cat"].predict_proba(x_svd)[0, 1])
    avg_proba = (lr_proba + rf_proba + cat_proba) / 3.0

    positive_factors, negative_factors = _explain(models, clean_text, tfidf_vec, ner_features)

    return {
        "lr_proba": lr_proba,
        "rf_proba": rf_proba,
        "cat_proba": cat_proba,
        "avg_proba": avg_proba,
        "ner_features": ner_features,
        "positive_factors": positive_factors,
        "negative_factors": negative_factors,
    }


# Топ положительных/отрицательных факторов решения
def _explain(models: dict, clean_text: str, tfidf_vec, ner_features: dict) -> tuple[list[dict], list[dict]]:
    lr = models["hybrid_lr"]
    scaler = models["ner_scaler"]
    tfidf = models["tfidf"]

    feature_names = list(tfidf.get_feature_names_out()) + NER_FEATURE_NAMES
    coefs = lr.coef_[0]

    scores = [(feature_names[i], float(coefs[i] * tfidf_vec[0, i])) for i in tfidf_vec.nonzero()[1]]

    ner_arr = np.array([[ner_features[k] for k in NER_FEATURE_NAMES]], dtype=float)
    ner_scaled = scaler.transform(ner_arr)[0]
    n_tfidf = len(tfidf.vocabulary_)
    for j, name in enumerate(NER_FEATURE_NAMES):
        ru_name = NER_FEATURE_NAMES_RU.get(name, name)
        scores.append((ru_name, float(coefs[n_tfidf + j] * ner_scaled[j])))

    scores.sort(key=lambda x: abs(x[1]), reverse=True)
    positive = [{"label": label, "weight": weight} for label, weight in scores if weight > 0][:6]
    negative = [{"label": label, "weight": weight} for label, weight in scores if weight < 0][:6]
    return positive, negative