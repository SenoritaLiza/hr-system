FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt ./ml-requirements.txt
COPY backend/requirements.txt ./backend-requirements.txt
RUN for i in 1 2 3 4 5 6; do \
      pip install --timeout=180 -r ml-requirements.txt -r backend-requirements.txt && exit 0; \
      echo "pip install failed (attempt $i), retrying..."; \
      sleep 10; \
    done; \
    exit 1
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords')"

COPY preprocessing.py ner_module.py ./
COPY backend/app ./app
COPY backend/alembic ./alembic
COPY backend/alembic.ini ./

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]