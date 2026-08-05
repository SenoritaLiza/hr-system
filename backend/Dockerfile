FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .
RUN for i in 1 2 3 4 5 6; do \
      pip install --timeout=180 -r requirements.txt && exit 0; \
      echo "pip install failed (attempt $i), retrying..."; \
      sleep 10; \
    done; \
    exit 1

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]