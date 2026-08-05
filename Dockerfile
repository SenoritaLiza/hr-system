FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    for i in 1 2 3 4 5 6; do \
      pip install --timeout=180 -r requirements.txt && exit 0; \
      echo "pip install failed (attempt $i), retrying..."; \
      sleep 10; \
    done; \
    exit 1
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords')"

COPY . .

EXPOSE 8501
CMD ["streamlit", "run", "app.py", "--server.address=0.0.0.0", "--server.port=8501"]